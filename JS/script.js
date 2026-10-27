const tableBody = document.getElementById("userData");
const userIdInput = document.getElementById("userIdInput");
const searchBtn = document.getElementById("searchBtn");
const singleUser = document.getElementById("singleUser");
const createUserForm = document.getElementById("createUserForm");
const newUser = document.getElementById("newUser");

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
  const response = await fetch("https://jsonplaceholder.typicode.com/users");
  const users = await response.json();
  console.log(users);
  users.forEach((user) => {
    tableBody.innerHTML += `<tr><td>${user.id}</td><td>${user.name}</td><td>${user.email}</td><td>${user.phone}</td><td>${formatAddress(user.address)}</td></tr>`;
  });
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
