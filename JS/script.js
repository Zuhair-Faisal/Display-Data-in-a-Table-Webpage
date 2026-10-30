const tableBody = document.getElementById("userData");
const userIdInput = document.getElementById("userIdInput");
const searchBtn = document.getElementById("searchBtn");
const singleUser = document.getElementById("singleUser");
const createUserForm = document.getElementById("createUserForm");
const newUser = document.getElementById("newUser");
const putBtn = document.getElementById("putBtn");
const editResult = document.getElementById("editResult");
let currentUser = null;

function formatAddress(address) {
  return `${address.suite}, ${address.street}, ${address.city} ${address.zipcode}`;
}

async function getSingleUser(userId) {
  if (userId === "") {
    singleUser.innerHTML = "<p>Please enter an ID.</p>";
    return;
  }

  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users/${userId}`,
    );

    if (!response.ok) {
      throw new Error("User not found");
    }

    const user = await response.json();

    singleUser.innerHTML = `
      <p><strong>ID:</strong> ${user.id}</p>
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Phone:</strong> ${user.phone}</p>
      <p><strong>Address:</strong> ${formatAddress(user.address)}</p>
    `;
  } catch (error) {
    singleUser.innerHTML = "<p>User not found.</p>";
  }
}
searchBtn.addEventListener("click", () => {
  getSingleUser(userIdInput.value);
});

async function getUsers() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!response.ok) {
      throw new Error("Could not fetch users");
    }
    const users = await response.json();
    console.log(users);
    users.forEach((user) => {
      tableBody.innerHTML += `<tr><td>${user.id}</td><td>${user.name}</td><td>${user.email}</td><td>${user.phone}</td><td>${formatAddress(user.address)}</td><td>
              <button class="edit-btn" data-id="${user.id}">Edit</button>
              <button class="delete-btn" data-id="${user.id}">Delete</button>
            </td></tr>`;
    });
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="6">Could not Load Users. Please Check your Connection and Refresh.</td></tr>`;
  }
}

getUsers();

async function createUser(event) {
  event.preventDefault();

  const userData = {
    name: document.getElementById("nameInput").value,
    email: document.getElementById("emailInput").value,
    phone: document.getElementById("phoneInput").value,
    address: {
      city: document.getElementById("userAddress").value,
    },
  };

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Could not create user");
    }

    const createdUser = await response.json();
    console.log(createdUser);

    newUser.innerHTML = `
      <p>User created!</p>
      <p><strong>ID:</strong> ${createdUser.id}</p>
      <p><strong>Name:</strong> ${createdUser.name}</p>
      <p><strong>Email:</strong> ${createdUser.email}</p>
      <p><strong>Phone:</strong> ${createdUser.phone}</p>
      <p><strong>City:</strong> ${createdUser.address.city}</p>
    `;

    tableBody.insertAdjacentHTML(
      "beforeend",
      `<tr class="new-row">
        <td>${createdUser.id}</td>
        <td>${createdUser.name}</td>
        <td>${createdUser.email}</td>
        <td>${createdUser.phone}</td>
        <td>${createdUser.address.city}</td>
      </tr>`,
    );

    createUserForm.reset();
  } catch (error) {
    newUser.innerHTML = "<p>Something went wrong. Please try again.</p>";
  }
}

createUserForm.addEventListener("submit", createUser);

tableBody.addEventListener("click", async (event) => {
  if (!event.target.classList.contains("delete-btn")) {
    return;
  }
  const button = event.target;
  const userId = button.dataset.id;
  if (!confirm(`Delete user ${userId}?`)) {
    return;
  }
  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users/${userId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      throw new Error("Could Not Delete User");
    }
    button.closest("tr").remove();
  } catch (error) {
    alert("Could Not Delete User. Please Try Again.");
  }
});

tableBody.addEventListener("click", async (event) => {
  if (!event.target.classList.contains("edit-btn")) {
    return;
  }
  const userId = event.target.dataset.id;
  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users/${userId}`,
    );
    if (!response.ok) {
      throw new Error("User Not Found");
    }
    currentUser = await response.json();
    document.getElementById("editName").value = currentUser.name;
    document.getElementById("editEmail").value = currentUser.email;
    document.getElementById("editPhone").value = currentUser.phone;
    document.getElementById("editCity").value = currentUser.address.city;
    document.getElementById("editInfo").textContent =
      `Editing User ${currentUser.id}`;
  } catch (error) {
    document.getElementById("editInfo").textContent =
      "Could Not Load this User.";
  }
});

putBtn.addEventListener("click", async () => {});

document.getElementById("putBtn").addEventListener("click", async () => {
  if (currentUser === null) {
    document.getElementById("editInfo").textContent =
      "Click Edit on a User First";
    return;
  }

  const updatedUser = {
    name: document.getElementById("editName").value,
    email: document.getElementById("editEmail").value,
    phone: document.getElementById("editPhone").value,
    address: {
      city: document.getElementById("editCity").value,
    },
  };

  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users/${currentUser.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      },
    );

    if (!response.ok) {
      throw new Error("Update Failed");
    }

    const result = await response.json();
    document.getElementById("editResult").textContent = JSON.stringify(
      result,
      null,
      2,
    );
  } catch (error) {
    document.getElementById("editResult").textContent =
      "Could not update the user.";
  }
});

document.getElementById("patchBtn").addEventListener("click", async () => {
  if (currentUser === null) {
    document.getElementById("editInfo").textContent =
      "Click Edit on a User First";
    return;
  }
  const name = document.getElementById("editName").value;
  const email = document.getElementById("editEmail").value;
  const phone = document.getElementById("editPhone").value;
  const city = document.getElementById("editCity").value;

  const changes = {};

  if (name !== currentUser.name) {
    changes.name = name;
  }
  if (email !== currentUser.email) {
    changes.email = email;
  }
  if (phone !== currentUser.phone) {
    changes.phone = phone;
  }
  if (city !== currentUser.address.city) {
    changes.address = { ...currentUser.address, city: city };
  }

  if (Object.keys(changes).length === 0) {
    document.getElementById("editResult").textContent = "Nothing Changed";
  }

  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users/${currentUser.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changes),
      },
    );
    if (!response.ok) {
      throw new Error("Update Failed");
    }

    const result = await response.json();
    document.getElementById("editResult").testContent = JSON.stringify(
      result,
      null,
      2,
    );
  } catch (error) {
    document.getElementById("editResult").textContent =
      "Could not Update the User";
  }
});
