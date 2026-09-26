import base64
import hashlib
import os
import secrets
from urllib.parse import urlencode

import httpx
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv

from auth import create_access_token
from database import database

load_dotenv()

router = APIRouter(
    prefix="/auth",
    tags=["Social Authentication"],
)

users_collection = database["users"]

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173",
)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI",
    "http://localhost:8000/auth/google/callback",
)

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
GITHUB_REDIRECT_URI = os.getenv(
    "GITHUB_REDIRECT_URI",
    "http://localhost:8000/auth/github/callback",
)

COOKIE_MAX_AGE = 60 * 60 * 24


def set_auth_cookie(response: RedirectResponse, user_id: str):
    token = create_access_token(user_id)

    response.set_cookie(
        key="taskflow_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=COOKIE_MAX_AGE,
    )


def oauth_error(message: str):
    error_url = (
        f"{FRONTEND_URL}/"
        f"?oauth_error={message}"
    )

    return RedirectResponse(
        url=error_url,
        status_code=302,
    )


def create_or_get_social_user(
    *,
    email: str,
    name: str,
    provider: str,
    provider_id: str,
    profile_image: str | None = None,
):
    email = email.lower().strip()

    existing_user = users_collection.find_one(
        {"email": email}
    )

    if existing_user:
        existing_provider = existing_user.get(
            "auth_provider"
        )

        existing_provider_id = existing_user.get(
            "provider_id"
        )

        if (
            existing_provider != provider
            or existing_provider_id != provider_id
        ):
            raise HTTPException(
                status_code=409,
                detail=(
                    "An account already exists with this "
                    "email. Please use the original login method."
                ),
            )

        update_data = {
            "name": name,
        }

        if profile_image:
            update_data["profile_image"] = profile_image

        users_collection.update_one(
            {"_id": existing_user["_id"]},
            {"$set": update_data},
        )

        return users_collection.find_one(
            {"_id": existing_user["_id"]}
        )

    user_data = {
        "name": name,
        "email": email,
        "password": None,
        "role": "user",
        "auth_provider": provider,
        "provider_id": provider_id,
        "profile_image": profile_image,
    }

    result = users_collection.insert_one(
        user_data
    )

    return users_collection.find_one(
        {"_id": result.inserted_id}
    )


# ============================================================
# GOOGLE OAUTH
# ============================================================

@router.get("/google/login")
def google_login(response: Response = None):
    if not GOOGLE_CLIENT_ID:
        return oauth_error(
            "Google authentication is not configured."
        )

    state = secrets.token_urlsafe(32)

    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
    }

    authorization_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        + urlencode(params)
    )

    redirect_response = RedirectResponse(
        url=authorization_url,
        status_code=302,
    )

    redirect_response.set_cookie(
        key="google_oauth_state",
        value=state,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=600,
    )

    return redirect_response


@router.get("/google/callback")
async def google_callback(
    request: Request,
):
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        return oauth_error(
            "Google authentication is not configured."
        )

    error = request.query_params.get("error")

    if error:
        return oauth_error(
            "Google sign-in was cancelled."
        )

    code = request.query_params.get("code")
    returned_state = request.query_params.get("state")

    saved_state = request.cookies.get(
        "google_oauth_state"
    )

    if not code:
        return oauth_error(
            "Google authorization code was not received."
        )

    if (
        not returned_state
        or not saved_state
        or not secrets.compare_digest(
            returned_state,
            saved_state,
        )
    ):
        return oauth_error(
            "Invalid Google authentication state."
        )

    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    try:
        async with httpx.AsyncClient(
            timeout=15.0
        ) as client:

            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data=token_data,
            )

            if token_response.status_code != 200:
                return oauth_error(
                    "Unable to authenticate with Google."
                )

            token_json = token_response.json()

            access_token = token_json.get(
                "access_token"
            )

            if not access_token:
                return oauth_error(
                    "Google did not return an access token."
                )

            userinfo_response = await client.get(
                "https://openidconnect.googleapis.com/v1/userinfo",
                headers={
                    "Authorization": (
                        f"Bearer {access_token}"
                    )
                },
            )

            if userinfo_response.status_code != 200:
                return oauth_error(
                    "Unable to retrieve Google profile."
                )

            google_user = userinfo_response.json()

    except httpx.HTTPError:
        return oauth_error(
            "Unable to connect to Google."
        )

    google_id = google_user.get("sub")
    email = google_user.get("email")
    name = (
        google_user.get("name")
        or google_user.get("given_name")
        or "Google User"
    )
    profile_image = google_user.get("picture")

    if not google_id or not email:
        return oauth_error(
            "Google account did not provide a valid email."
        )

    if google_user.get("email_verified") is not True:
        return oauth_error(
            "Your Google email must be verified."
        )

    try:
        user = create_or_get_social_user(
            email=email,
            name=name,
            provider="google",
            provider_id=str(google_id),
            profile_image=profile_image,
        )
    except HTTPException as error:
        return oauth_error(error.detail)
    except Exception:
        return oauth_error(
            "Unable to create your TaskFlow account."
        )

    redirect_response = RedirectResponse(
        url=FRONTEND_URL,
        status_code=302,
    )

    set_auth_cookie(
        redirect_response,
        str(user["_id"]),
    )

    redirect_response.delete_cookie(
        key="google_oauth_state"
    )

    return redirect_response


# ============================================================
# GITHUB OAUTH
# ============================================================

def generate_github_pkce():
    code_verifier = (
        secrets.token_urlsafe(64)
    )

    digest = hashlib.sha256(
        code_verifier.encode("utf-8")
    ).digest()

    code_challenge = (
        base64.urlsafe_b64encode(digest)
        .decode("utf-8")
        .rstrip("=")
    )

    return code_verifier, code_challenge


@router.get("/github/login")
def github_login():
    if not GITHUB_CLIENT_ID:
        return oauth_error(
            "GitHub authentication is not configured."
        )

    state = secrets.token_urlsafe(32)

    code_verifier, code_challenge = (
        generate_github_pkce()
    )

    params = {
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": GITHUB_REDIRECT_URI,
        "scope": "read:user user:email",
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
    }

    authorization_url = (
        "https://github.com/login/oauth/authorize?"
        + urlencode(params)
    )

    redirect_response = RedirectResponse(
        url=authorization_url,
        status_code=302,
    )

    redirect_response.set_cookie(
        key="github_oauth_state",
        value=state,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=600,
    )

    redirect_response.set_cookie(
        key="github_code_verifier",
        value=code_verifier,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=600,
    )

    return redirect_response


@router.get("/github/callback")
async def github_callback(
    request: Request,
):
    if (
        not GITHUB_CLIENT_ID
        or not GITHUB_CLIENT_SECRET
    ):
        return oauth_error(
            "GitHub authentication is not configured."
        )

    error = request.query_params.get("error")

    if error:
        return oauth_error(
            "GitHub sign-in was cancelled."
        )

    code = request.query_params.get("code")
    returned_state = request.query_params.get("state")

    saved_state = request.cookies.get(
        "github_oauth_state"
    )

    code_verifier = request.cookies.get(
        "github_code_verifier"
    )

    if not code:
        return oauth_error(
            "GitHub authorization code was not received."
        )

    if (
        not returned_state
        or not saved_state
        or not secrets.compare_digest(
            returned_state,
            saved_state,
        )
    ):
        return oauth_error(
            "Invalid GitHub authentication state."
        )

    if not code_verifier:
        return oauth_error(
            "GitHub authentication session expired."
        )

    token_data = {
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": code,
        "redirect_uri": GITHUB_REDIRECT_URI,
        "code_verifier": code_verifier,
    }

    try:
        async with httpx.AsyncClient(
            timeout=15.0
        ) as client:

            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                data=token_data,
                headers={
                    "Accept": "application/json",
                },
            )

            if token_response.status_code != 200:
                return oauth_error(
                    "Unable to authenticate with GitHub."
                )

            token_json = token_response.json()

            access_token = token_json.get(
                "access_token"
            )

            if not access_token:
                return oauth_error(
                    "GitHub did not return an access token."
                )

            github_headers = {
                "Authorization": (
                    f"Bearer {access_token}"
                ),
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            }

            user_response = await client.get(
                "https://api.github.com/user",
                headers=github_headers,
            )

            if user_response.status_code != 200:
                return oauth_error(
                    "Unable to retrieve GitHub profile."
                )

            github_user = user_response.json()

            emails_response = await client.get(
                "https://api.github.com/user/emails",
                headers=github_headers,
            )

            if emails_response.status_code != 200:
                return oauth_error(
                    "Unable to retrieve GitHub email."
                )

            github_emails = emails_response.json()

    except httpx.HTTPError:
        return oauth_error(
            "Unable to connect to GitHub."
        )

    github_id = github_user.get("id")

    if not github_id:
        return oauth_error(
            "Invalid GitHub account."
        )

    primary_email = None

    for email_item in github_emails:
        if (
            email_item.get("primary")
            and email_item.get("verified")
        ):
            primary_email = email_item.get("email")
            break

    if not primary_email:
        for email_item in github_emails:
            if email_item.get("verified"):
                primary_email = email_item.get(
                    "email"
                )
                break

    if not primary_email:
        return oauth_error(
            "Please verify an email address on GitHub "
            "before signing in."
        )

    name = (
        github_user.get("name")
        or github_user.get("login")
        or "GitHub User"
    )

    profile_image = github_user.get(
        "avatar_url"
    )

    try:
        user = create_or_get_social_user(
            email=primary_email,
            name=name,
            provider="github",
            provider_id=str(github_id),
            profile_image=profile_image,
        )
    except HTTPException as error:
        return oauth_error(error.detail)
    except Exception:
        return oauth_error(
            "Unable to create your TaskFlow account."
        )

    redirect_response = RedirectResponse(
        url=FRONTEND_URL,
        status_code=302,
    )

    set_auth_cookie(
        redirect_response,
        str(user["_id"]),
    )

    redirect_response.delete_cookie(
        key="github_oauth_state"
    )

    redirect_response.delete_cookie(
        key="github_code_verifier"
    )

    return redirect_response