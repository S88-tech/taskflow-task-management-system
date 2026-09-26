def task_serializer(task):

    return {
        "id": str(task["_id"]),

        "title": task["title"],

        "description": task["description"],

        "priority": task["priority"],

        "dueDate": task["dueDate"],

        "status": task["status"],

        "assigned_to": str(
            task["assigned_to"]
        ) if task.get("assigned_to") else None,

        "created_by": str(
            task["created_by"]
        ) if task.get("created_by") else None,
    }