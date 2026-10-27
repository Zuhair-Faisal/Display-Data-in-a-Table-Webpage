const tableBody = document.getElementById("userData");
const userIdInput = document.getElementById("userIdInput");
const searchBtn = document.getElementById("searchBtn");
const singleUser = document.getElementById("singleUser");

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
