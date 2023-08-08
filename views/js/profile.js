$(document).ready(async function () {
    // Load user profile
    try {
        const response = await fetch(`/api/users/profile?token=${sessionStorage.token}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const userData = await response.json();
            $("#name").val(userData.name);
            $("#email").val(userData.email);
            $("#password").val("********"); // Display a placeholder for password

            $("#updateProfileForm").submit(async function (event) {
                event.preventDefault();
                const newName = $("#newName").val();
                const newEmail = $("#newEmail").val();
                const newPassword = $("#newPassword").val();

                try {
                    const updateData = {};
                    if (newName) updateData.name = newName;
                    if (newEmail) updateData.email = newEmail;
                    if (newPassword) updateData.password = newPassword;

                    const updateResponse = await fetch(`/api/users/profile?token=${sessionStorage.token}`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(updateData)
                    });

                    if (updateResponse.ok) {
                        alert("Profile updated successfully");
                        location.reload();
                    } else {
                        const err = await updateResponse.json();
                        alert(err.message);
                    }
                } catch (error) {
                    console.error(error);
                    alert("An error occurred while updating the profile");
                }
            });
        } else {
            const err = await response.json();
            console.error("Error:", err);
            alert(err.message);
        }
    } catch (error) {
        console.error(error);
        alert("An error occurred while loading user profile");
    }
});
