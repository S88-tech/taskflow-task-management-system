import os

from datetime import datetime, timedelta, timezone

import bcrypt

from dotenv import load_dotenv

from fastapi import (
    Depends,
    HTTPException,
    Request,
    status,
)

from jose import JWTError, jwt

from bson import ObjectId

from database import database


# =========================
# LOAD ENVIRONMENT VARIABLES
# =========================

load_dotenv()


# =========================
# JWT CONFIGURATION
# =========================

SECRET_KEY = os.getenv(
    "JWT_SECRET",
    "development-secret-change-this"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


# =========================
# USER COLLECTION
# =========================

users_collection = database["users"]


# =========================
# PASSWORD HASHING
# =========================

def hash_password(password: str) -> str:
    """
    Convert plain password into a secure hash.
    """

    password_bytes = password.encode("utf-8")

    hashed_password = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt()
    )

    return hashed_password.decode("utf-8")


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    """
    Compare entered password with stored hash.
    """

    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


# =========================
# CREATE JWT TOKEN
# =========================

def create_access_token(user_id: str) -> str:
    """
    Create JWT token for authenticated user.
    """

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {
        "sub": user_id,
        "exp": expire,
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# =========================
# GET CURRENT USER
# =========================

def get_current_user(
    request: Request
):
    """
    Get currently authenticated user
    from the HttpOnly JWT cookie.
    """

    token = request.cookies.get(
        "taskflow_token"
    )

    # No token
    if not token:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    # Decode JWT
    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id:

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )

    except JWTError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    # Validate MongoDB ObjectId
    if not ObjectId.is_valid(user_id):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID"
        )

    # Find user
    user = users_collection.find_one(
        {
            "_id": ObjectId(user_id)
        }
    )

    if not user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user


# =========================
# REQUIRE ADMIN
# =========================

def require_admin(
    current_user=Depends(get_current_user)
):
    """
    Allow access only to administrators.
    """

    if current_user.get("role") != "admin":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return current_user