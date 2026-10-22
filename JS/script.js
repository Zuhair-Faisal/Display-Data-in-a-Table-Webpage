const tableBody = document.getElementById("userData");

async function getUsers() {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    const users = await response.json();
    console.log(users);
    users.forEach((user) => {
        tableBody.innerHTML += `<tr><td>${user.id}</td><td>${user.name}</td><td>${user.email}</td><td>${user.phone}</td><td>${user.address.city}</td></tr>`;
    });
};

getUsers();