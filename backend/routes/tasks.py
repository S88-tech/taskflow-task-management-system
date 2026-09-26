from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from bson import ObjectId

from database import (
    database,
    tasks_collection,
)

from models import task_serializer

from schemas import (
    TaskCreate,
    TaskUpdate,
    TaskStatusUpdate,
)

from auth import (
    get_current_user,
    require_admin,
)


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


users_collection = database["users"]


# =========================================================
# GET TASKS
# ADMIN -> ALL TASKS
# USER  -> ONLY ASSIGNED TASKS
# =========================================================

@router.get("/")
def get_tasks(
    current_user=Depends(get_current_user),
):
    if current_user.get("role") == "admin":

        tasks = tasks_collection.find(
            {}
        )

    else:

        tasks = tasks_collection.find(
            {
                "assigned_to": current_user["_id"]
            }
        )

    return {
        "message": "Tasks fetched successfully",
        "tasks": [
            task_serializer(task)
            for task in tasks
        ],
    }


# =========================================================
# GET SINGLE TASK
# ADMIN -> ANY TASK
# USER  -> ONLY ASSIGNED TASK
# =========================================================

@router.get("/{task_id}")
def get_task(
    task_id: str,
    current_user=Depends(get_current_user),
):

    if not ObjectId.is_valid(task_id):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID",
        )

    query = {
        "_id": ObjectId(task_id)
    }

    if current_user.get("role") != "admin":

        query["assigned_to"] = current_user["_id"]

    task = tasks_collection.find_one(
        query
    )

    if not task:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return {
        "message": "Task fetched successfully",
        "task": task_serializer(task),
    }


# =========================================================
# UPDATE TASK STATUS
#
# USER  -> ONLY THEIR ASSIGNED TASK
# ADMIN -> ANY TASK
# =========================================================

@router.patch("/{task_id}/status")
def update_task_status(
    task_id: str,
    status_data: TaskStatusUpdate,
    current_user=Depends(get_current_user),
):

    if not ObjectId.is_valid(task_id):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID",
        )

    query = {
        "_id": ObjectId(task_id)
    }

    if current_user.get("role") != "admin":

        query["assigned_to"] = current_user["_id"]

    result = tasks_collection.update_one(
        query,
        {
            "$set": {
                "status": status_data.status
            }
        },
    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    updated_task = tasks_collection.find_one(
        {
            "_id": ObjectId(task_id)
        }
    )

    return {
        "message": "Task status updated successfully",
        "task": task_serializer(
            updated_task
        ),
    }


# =========================================================
# CREATE TASK
# ADMIN ONLY
# =========================================================

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    task: TaskCreate,
    current_user=Depends(require_admin),
):

    # -----------------------------------------------------
    # VALIDATE USER ID
    # -----------------------------------------------------

    if not ObjectId.is_valid(
        task.assigned_to
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid assigned user ID",
        )

    assigned_user_id = ObjectId(
        task.assigned_to
    )

    # -----------------------------------------------------
    # CHECK USER EXISTS
    # -----------------------------------------------------

    assigned_user = users_collection.find_one(
        {
            "_id": assigned_user_id
        }
    )

    if not assigned_user:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assigned user not found",
        )

    # -----------------------------------------------------
    # ONLY NORMAL USERS CAN BE ASSIGNED
    # -----------------------------------------------------

    if assigned_user.get("role") != "user":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tasks can only be assigned to normal users.",
        )

    # -----------------------------------------------------
    # CREATE TASK
    # -----------------------------------------------------

    task_data = {
        "title": task.title.strip(),
        "description": task.description.strip(),
        "priority": task.priority,
        "dueDate": task.dueDate.isoformat(),
        "status": "pending",
        "created_by": current_user["_id"],
        "assigned_to": assigned_user_id,
    }

    result = tasks_collection.insert_one(
        task_data
    )

    created_task = tasks_collection.find_one(
        {
            "_id": result.inserted_id
        }
    )

    return {
        "message": "Task created and assigned successfully",
        "task": task_serializer(
            created_task
        ),
    }


# =========================================================
# UPDATE TASK
# ADMIN ONLY
# =========================================================

@router.put("/{task_id}")
def update_task(
    task_id: str,
    task: TaskUpdate,
    current_user=Depends(require_admin),
):

    if not ObjectId.is_valid(task_id):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID",
        )

    # -----------------------------------------------------
    # VALIDATE ASSIGNED USER
    # -----------------------------------------------------

    if not ObjectId.is_valid(
        task.assigned_to
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid assigned user ID",
        )

    assigned_user_id = ObjectId(
        task.assigned_to
    )

    assigned_user = users_collection.find_one(
        {
            "_id": assigned_user_id
        }
    )

    if not assigned_user:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assigned user not found",
        )

    if assigned_user.get("role") != "user":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tasks can only be assigned to normal users.",
        )

    # -----------------------------------------------------
    # UPDATE TASK
    # -----------------------------------------------------

    updated_data = {
        "title": task.title.strip(),
        "description": task.description.strip(),
        "priority": task.priority,
        "dueDate": task.dueDate.isoformat(),
        "status": task.status,
        "assigned_to": assigned_user_id,
    }

    result = tasks_collection.update_one(
        {
            "_id": ObjectId(task_id)
        },
        {
            "$set": updated_data
        },
    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    updated_task = tasks_collection.find_one(
        {
            "_id": ObjectId(task_id)
        }
    )

    return {
        "message": "Task updated successfully",
        "task": task_serializer(
            updated_task
        ),
    }


# =========================================================
# DELETE TASK
# ADMIN ONLY
# =========================================================

@router.delete("/{task_id}")
def delete_task(
    task_id: str,
    current_user=Depends(require_admin),
):

    if not ObjectId.is_valid(task_id):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID",
        )

    result = tasks_collection.delete_one(
        {
            "_id": ObjectId(task_id)
        }
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return {
        "message": "Task deleted successfully"
    }