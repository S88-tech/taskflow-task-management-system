from datetime import date

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
)


# =========================================================
# AUTH
# =========================================================

class UserRegister(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=50
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=6,
        max_length=100
    )


class UserLogin(BaseModel):
    email: EmailStr

    password: str = Field(
        ...,
        min_length=6,
        max_length=100
    )


# =========================================================
# CHANGE PASSWORD
# =========================================================

class ChangePassword(BaseModel):
    current_password: str = Field(
        ...,
        min_length=6,
        max_length=100
    )

    new_password: str = Field(
        ...,
        min_length=6,
        max_length=100
    )


# =========================================================
# TASK CREATE
# ADMIN ONLY
# =========================================================

class TaskCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    description: str = Field(
        ...,
        min_length=1,
        max_length=500
    )

    priority: str = Field(
        default="medium",
        pattern="^(low|medium|high)$"
    )

    dueDate: date

    assigned_to: str


# =========================================================
# TASK UPDATE
# ADMIN ONLY
# =========================================================

class TaskUpdate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    description: str = Field(
        ...,
        min_length=1,
        max_length=500
    )

    priority: str = Field(
        default="medium",
        pattern="^(low|medium|high)$"
    )

    dueDate: date

    status: str = Field(
        default="pending",
        pattern="^(pending|completed)$"
    )

    assigned_to: str


# =========================================================
# TASK STATUS UPDATE
# USER + ADMIN
# =========================================================

class TaskStatusUpdate(BaseModel):
    status: str = Field(
        ...,
        pattern="^(pending|completed)$"
    )