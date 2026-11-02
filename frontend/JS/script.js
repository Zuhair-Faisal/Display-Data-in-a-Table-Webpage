const API_URL = "http://localhost:3000/users";
const tableBody = document.getElementById("userData");
const userIdInput = document.getElementById("userIdInput");
const searchBtn = document.getElementById("searchBtn");
const singleUser = document.getElementById("singleUser");
const createUserForm = document.getElementById("createUserForm");
const newUser = document.getElementById("newUser");
const editUserForm = document.getElementById("editUserForm");
const editInfo = document.getElementById("editInfo");
const editResult = document.getElementById("editResult");
const editName = document.getElementById("editName");
const editEmail = document.getElementById("editEmail");
const editPhone = document.getElementById("editPhone");
const editCity = document.getElementById("editCity");
const putBtn = document.getElementById("putBtn");
const patchBtn = document.getElementById("patchBtn");

let users = [];
let currentUser = null;

function formatAddress(address = {}) {
  return [address.suite, address.street, address.city, address.zipcode]
    .filter(Boolean)
    .join(", ");
}

function userRow(user) {
  return `
    <tr>
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.phone}</td>
      <td>${formatAddress(user.address)}</td>
      <td>
        <button class="edit-btn" data-id="${user.id}">Edit</button>
        <button class="delete-btn" data-id="${user.id}">Delete</button>
      </td>
    </tr>`;
}

function renderTable() {
  if (users.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6">No users yet.</td></tr>`;
    return;
  }
  tableBody.innerHTML = users.map(userRow).join("");
}

function replaceUser(updatedUser) {
  users = users.map((user) =>
    user.id === updatedUser.id ? updatedUser : user,
  );
  renderTable();
}

function clearEditForm() {
  currentUser = null;
  editUserForm.reset();
  editInfo.textContent = 'Click "Edit" on a user in the table.';
  editResult.textContent = "";
}

async function getUsers() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Could not fetch users");
    }
    users = await response.json();
    renderTable();
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="6">Could not load users. Is the API server running?</td></tr>`;
  }
}

async function getSingleUser(userId) {
  if (userId === "") {
    singleUser.innerHTML = "<p>Please enter an ID.</p>";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${userId}`);
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
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error("Could not create user");
    }
    const createdUser = await response.json();

    newUser.innerHTML = `
      <p>User created!</p>
      <p><strong>ID:</strong> ${createdUser.id}</p>
      <p><strong>Name:</strong> ${createdUser.name}</p>
      <p><strong>Email:</strong> ${createdUser.email}</p>
      <p><strong>Phone:</strong> ${createdUser.phone}</p>
      <p><strong>City:</strong> ${createdUser.address.city}</p>
    `;

    users.push(createdUser);
    renderTable(); // new row now gets Edit/Delete buttons too
    createUserForm.reset();
  } catch (error) {
    newUser.innerHTML = "<p>Something went wrong. Please try again.</p>";
  }
}

async function deleteUser(userId) {
  if (!confirm(`Delete user ${userId}?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${userId}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Could not delete user");
    }

    users = users.filter((user) => user.id !== userId);
    renderTable();

    if (currentUser !== null && currentUser.id === userId) {
      clearEditForm();
    }
  } catch (error) {
    alert("Could not delete the user. Please try again.");
  }
}

async function loadUserIntoEditForm(userId) {
  try {
    const response = await fetch(`${API_URL}/${userId}`);
    if (!response.ok) {
      throw new Error("User not found");
    }
    currentUser = await response.json();

    editName.value = currentUser.name;
    editEmail.value = currentUser.email;
    editPhone.value = currentUser.phone;
    editCity.value = currentUser.address?.city ?? "";
    editInfo.textContent = `Editing user ${currentUser.id}`;
    editResult.textContent = "";
  } catch (error) {
    editInfo.textContent = "Could not load this user.";
  }
}

async function replaceUserWithPut() {
  if (currentUser === null) {
    editInfo.textContent = "Click Edit on a user first.";
    return;
  }

  const updatedUser = {
    name: editName.value,
    email: editEmail.value,
    phone: editPhone.value,
    address: { city: editCity.value },
  };

  try {
    const response = await fetch(`${API_URL}/${currentUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    });
    if (!response.ok) {
      throw new Error("Update failed");
    }
    const result = await response.json();

    currentUser = result;
    replaceUser(result);
    editResult.textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    editResult.textContent = "Could not update the user.";
  }
}

async function updateUserWithPatch() {
  if (currentUser === null) {
    editInfo.textContent = "Click Edit on a user first.";
    return;
  }

  const changes = {};
  if (editName.value !== currentUser.name) changes.name = editName.value;
  if (editEmail.value !== currentUser.email) changes.email = editEmail.value;
  if (editPhone.value !== currentUser.phone) changes.phone = editPhone.value;
  if (editCity.value !== (currentUser.address?.city ?? "")) {
    changes.address = { ...currentUser.address, city: editCity.value };
  }

  if (Object.keys(changes).length === 0) {
    editResult.textContent = "Nothing changed.";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${currentUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
    if (!response.ok) {
      throw new Error("Update failed");
    }
    const result = await response.json();

    currentUser = result;
    replaceUser(result);
    editResult.textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    editResult.textContent = "Could not update the user.";
  }
}

searchBtn.addEventListener("click", () => {
  getSingleUser(userIdInput.value);
});

userIdInput.addEventListener("wheel", () => {
  userIdInput.blur();
});

createUserForm.addEventListener("submit", createUser);

tableBody.addEventListener("click", (event) => {
  const button = event.target;
  const userId = Number(button.dataset.id);

  if (button.classList.contains("delete-btn")) {
    deleteUser(userId);
  } else if (button.classList.contains("edit-btn")) {
    loadUserIntoEditForm(userId);
  }
});

putBtn.addEventListener("click", replaceUserWithPut);
patchBtn.addEventListener("click", updateUserWithPatch);

getUsers();
