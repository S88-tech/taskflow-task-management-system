import { useRef, useState } from "react";


const API_URL = "http://localhost:8000";


function Settings({
  user,
  onUserUpdated,
  onLogout,
}) {

  const fileInputRef =
    useRef(null);


  const [name, setName] =
    useState(
      user?.name || ""
    );


  const [selectedFile, setSelectedFile] =
    useState(null);


  const [preview, setPreview] =
    useState(
      user?.profile_image
        ? `${API_URL}${user.profile_image}`
        : ""
    );


  const [profileLoading, setProfileLoading] =
    useState(false);


  const [profileMessage, setProfileMessage] =
    useState("");


  const [profileError, setProfileError] =
    useState("");


  const [currentPassword, setCurrentPassword] =
    useState("");


  const [newPassword, setNewPassword] =
    useState("");


  const [confirmPassword, setConfirmPassword] =
    useState("");


  const [passwordLoading, setPasswordLoading] =
    useState(false);


  const [passwordMessage, setPasswordMessage] =
    useState("");


  const [passwordError, setPasswordError] =
    useState("");


  // =====================================================
  // PROFILE IMAGE SELECT
  // =====================================================

  const handleImageChange = (
    event
  ) => {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      setProfileError(
        "Only JPG, PNG and WEBP images are allowed."
      );

      return;
    }


    if (
      file.size >
      2 * 1024 * 1024
    ) {

      setProfileError(
        "Profile picture must be smaller than 2 MB."
      );

      return;
    }


    setProfileError("");

    setProfileMessage("");

    setSelectedFile(file);


    const imageUrl =
      URL.createObjectURL(file);

    setPreview(imageUrl);
  };


  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleProfileUpdate = async (
    event
  ) => {

    event.preventDefault();

    setProfileLoading(true);

    setProfileError("");

    setProfileMessage("");


    try {

      const formData =
        new FormData();


      formData.append(
        "name",
        name
      );


      if (selectedFile) {

        formData.append(
          "profile_picture",
          selectedFile
        );

      }


      const response =
        await fetch(
          `${API_URL}/profile/`,
          {
            method: "PUT",

            credentials: "include",

            body: formData,
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Unable to update profile."
        );

      }


      setProfileMessage(
        "Profile updated successfully."
      );


      setSelectedFile(null);


      if (
        data.user.profile_image
      ) {

        setPreview(
          `${API_URL}${data.user.profile_image}`
        );

      }


      onUserUpdated(
        data.user
      );


    } catch (error) {

      console.error(error);

      setProfileError(
        error.message
      );

    } finally {

      setProfileLoading(false);

    }
  };


  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handlePasswordChange =
    async (event) => {

      event.preventDefault();

      setPasswordError("");

      setPasswordMessage("");


      if (
        newPassword !==
        confirmPassword
      ) {

        setPasswordError(
          "New password and confirmation do not match."
        );

        return;
      }


      if (
        newPassword.length < 6
      ) {

        setPasswordError(
          "New password must contain at least 6 characters."
        );

        return;
      }


      setPasswordLoading(true);


      try {

        const response =
          await fetch(
            `${API_URL}/profile/change-password`,
            {

              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials: "include",

              body: JSON.stringify({

                current_password:
                  currentPassword,

                new_password:
                  newPassword,

              }),

            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Unable to change password."
          );

        }


        setPasswordMessage(
          "Password changed successfully."
        );


        setCurrentPassword("");

        setNewPassword("");

        setConfirmPassword("");


      } catch (error) {

        console.error(error);

        setPasswordError(
          error.message
        );

      } finally {

        setPasswordLoading(false);

      }
    };


  // =====================================================
  // UI
  // =====================================================

  return (

    <section className="tasks-section">

      <div className="section-header">

        <div>

          <h2>
            Settings
          </h2>

          <p>
            Manage your profile, account and security.
          </p>

        </div>

      </div>


      {/* =================================================
          PROFILE
          ================================================= */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div>

            <h3>
              Profile
            </h3>

            <p>
              Update your personal information and profile picture.
            </p>

          </div>

        </div>


        <form
          className="settings-form"
          onSubmit={
            handleProfileUpdate
          }
        >

          <div className="profile-editor">

            <div className="profile-picture-wrapper">

              {preview ? (

                <img
                  src={preview}
                  alt="Profile"
                  className="profile-picture-large"
                />

              ) : (

                <div className="profile-picture-placeholder">

                  {name
                    ?.charAt(0)
                    ?.toUpperCase() || "S"}

                </div>

              )}

              <button
                type="button"
                className="change-picture-btn"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                Change Photo
              </button>


              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleImageChange
                }
                hidden
              />

              <span className="settings-help">
                JPG, PNG or WEBP · Max 2 MB
              </span>

            </div>


            <div className="profile-fields">

              <div className="form-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  minLength="2"
                  maxLength="50"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={
                    user?.email || ""
                  }
                  disabled
                />

              </div>


              <div className="form-group">

                <label>
                  Role
                </label>

                <input
                  type="text"
                  value={
                    user?.role === "admin"
                      ? "Administrator"
                      : "User"
                  }
                  disabled
                />

              </div>

            </div>

          </div>


          {profileError && (

            <div className="settings-error">

              {profileError}

            </div>

          )}


          {profileMessage && (

            <div className="settings-success">

              {profileMessage}

            </div>

          )}


          <div className="settings-actions">

            <button
              type="submit"
              className="new-task-btn"
              disabled={
                profileLoading
              }
            >

              {profileLoading
                ? "Saving..."
                : "Save Profile"}

            </button>

          </div>

        </form>

      </div>


      {/* =================================================
          SECURITY
          ================================================= */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div>

            <h3>
              Security
            </h3>

            <p>
              Change your TaskFlow account password.
            </p>

          </div>

        </div>


        <form
          className="password-form"
          onSubmit={
            handlePasswordChange
          }
        >

          <div className="form-group">

            <label>
              Current Password
            </label>

            <input
              type="password"
              value={
                currentPassword
              }
              onChange={(event) =>
                setCurrentPassword(
                  event.target.value
                )
              }
              placeholder="Enter current password"
              required
            />

          </div>


          <div className="form-group">

            <label>
              New Password
            </label>

            <input
              type="password"
              value={
                newPassword
              }
              onChange={(event) =>
                setNewPassword(
                  event.target.value
                )
              }
              placeholder="Enter new password"
              minLength="6"
              required
            />

          </div>


          <div className="form-group">

            <label>
              Confirm New Password
            </label>

            <input
              type="password"
              value={
                confirmPassword
              }
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Confirm new password"
              minLength="6"
              required
            />

          </div>


          {passwordError && (

            <div className="settings-error">

              {passwordError}

            </div>

          )}


          {passwordMessage && (

            <div className="settings-success">

              {passwordMessage}

            </div>

          )}


          <div className="settings-actions">

            <button
              type="submit"
              className="new-task-btn"
              disabled={
                passwordLoading
              }
            >

              {passwordLoading
                ? "Changing..."
                : "Change Password"}

            </button>

          </div>

        </form>

      </div>


      {/* =================================================
          SIGN OUT
          ================================================= */}

      <div className="settings-card danger-card">

        <div>

          <h3>
            Sign out
          </h3>

          <p>
            Sign out of your TaskFlow account on this device.
          </p>

        </div>


        <button
          type="button"
          className="settings-logout-btn"
          onClick={onLogout}
        >
          Logout
        </button>

      </div>

    </section>

  );
}


export default Settings;