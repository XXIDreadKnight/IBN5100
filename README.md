# Deployment Assignment: Backend API & Frontend Display

This project demonstrates the deployment of a simple web application consisting of a Node.js/Express backend API and a vanilla HTML/JavaScript frontend to an AWS EC2 instance. The backend stores a piece of text, and the frontend displays the most recently stored text.

**Submitted URLs:**

*   **Backend URL Endpoint (for POST requests):** `http://<YOUR_EC2_PUBLIC_IP>:3000/api/create-answer`
*   **Frontend URL (for viewing the answer):** `http://<YOUR_EC2_PUBLIC_IP>:5173`

## Project Structure

├── backend/
│ ├── node_modules/
│ ├── package-lock.json
│ ├── package.json
│ └── server.js # Express backend server
├── frontend/
│ ├── node_modules/
│ ├── package-lock.json
│ ├── package.json
│ └── index.html # HTML page to display the answer
│ └── (serve is used to serve this directory)
└── README.md


## Technologies Used

*   **Backend:** Node.js, Express.js
*   **Frontend:** HTML, CSS, Vanilla JavaScript, `serve` (for serving static files)
*   **Deployment:** AWS EC2 (Amazon Linux 2023), PM2 (Process Manager)
*   **Version Control:** Git, GitHub

## Deployment to AWS EC2

The application was deployed following these general steps (as per the provided EC2 deployment guide):

1.  **AWS Account & EC2 Instance Setup:**
    *   Created an AWS account.
    *   Launched an EC2 instance (Amazon Linux 2023, t2.micro).
    *   Configured a key pair for SSH access.
    *   Configured network settings to allow SSH, HTTP, and HTTPS.

2.  **Connecting and Software Installation on EC2:**
    *   Connected to the EC2 instance via SSH.
    *   Updated the system (`sudo dnf update -y`).
    *   Installed Node.js (`sudo dnf install -y nodejs`).
    *   Installed Git (`sudo dnf install -y git`).

3.  **Application Code Setup:**
    *   Cloned the project repository from GitHub: `git clone <YOUR_GITHUB_REPO_URL>`
    *   Navigated into the project directory.
    *   Installed backend dependencies: `cd backend && npm install && cd ..`
    *   Installed frontend dependencies (primarily `serve`): `cd frontend && npm install && cd ..`

4.  **Security Group Configuration:**
    *   Edited the EC2 instance's security group inbound rules to allow:
        *   Custom TCP on Port `3000` from `0.0.0.0/0` (for the backend).
        *   Custom TCP on Port `5173` from `0.0.0.0/0` (for the frontend).

5.  **Application Configuration:**
    *   **Backend (`backend/server.js`):**
        *   Ensured the server listens on `0.0.0.0` and port `3000`.
        ```javascript
        const PORT = process.env.PORT || 3000;
        // ...
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Backend server listening on port ${PORT}`);
        });
        ```
    *   **Frontend (`frontend/index.html`):**
        *   Updated the `BACKEND_API_BASE_URL` to point to the EC2 instance's public IP and backend port:
        ```javascript
        const BACKEND_API_BASE_URL = 'http://<YOUR_EC2_PUBLIC_IP>:3000';
        ```
    *   **Frontend (`frontend/package.json`):**
        *   Ensured the `dev` and `start` scripts use `serve` on port `5173`:
        ```json
        "scripts": {
          "dev": "serve -s . -l 5173 --no-clipboard",
          "start": "serve -s . -l 5173 --no-clipboard"
        },
        ```

6.  **Running the Application with PM2:**
    *   Installed PM2 globally: `sudo npm install -g pm2`
    *   Started the backend:
        ```bash
        cd backend
        pm2 start npm --name backend -- run dev  # (or -- run start)
        cd ..
        ```
    *   Started the frontend:
        ```bash
        cd frontend
        pm2 start npm --name frontend -- run dev # (or -- run start)
        cd ..
        ```
    *   Ensured PM2 processes start on system reboot: `pm2 startup` (followed instructions) and `pm2 save`.

## How to Test (Fulfilling Assignment Requirements)

This demonstrates the interaction between the backend API and the frontend display.

**1. Send Data to the Backend API:**

Use a tool like `curl` (from your local machine or any machine with internet access) to send a `POST` request to the backend endpoint. This simulates the grading service sending data.

*   **Command:**
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"data": "Live test data from README!"}' http://<YOUR_EC2_PUBLIC_IP>:3000/api/create-answer
    ```
*   **Expected Output (from `curl`):**
    ```json
    {"message":"Data received successfully","currentData":"Live test data from README!"}
    ```
*   **On the EC2 backend logs (`pm2 logs backend`), you should see:**
    ```
    Received POST request to /api/create-answer
    Request body: { data: 'Live test data from README!' }
    Stored new data: Live test data from README!
    ```

**2. View the Data on the Frontend:**

Open your web browser and navigate to the frontend URL:

*   **URL:** `http://<YOUR_EC2_PUBLIC_IP>:5173`

*   **Expected Display:**
    The page should load, and the text "Live test data from README!" should appear inside an HTML `<span>` element with the `id="answer"`.
    The relevant HTML on the page will look like this after the JavaScript fetches the data:
    ```html
    <span id="answer">Live test data from README!</span>
    ```

**3. Send Different Data (Optional Test):**

*   **Command:**
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"data": "Updated text for testing!"}' http://<YOUR_EC2_PUBLIC_IP>:3000/api/create-answer
    ```
*   **Refresh the frontend page** (`http://<YOUR_EC2_PUBLIC_IP>:5173`) in your browser.
*   **Expected Display:** The text on the page should now update to "Updated text for testing!".

This confirms that the backend correctly receives and stores data, and the frontend correctly fetches and displays the most recent data sent to the backend, fulfilling all assignment requirements.
The note about "building frontend does not matter" is acknowledged; this setup serves the static `index.html` directly without a build step, which is appropriate for this simple vanilla JS frontend.

## Troubleshooting Common Issues During My Testing

*   **`EADDRINUSE` error for backend:** Ensured no other process (including previous PM2 instances) was using port 3000 by using `pm2 list`, `pm2 stop/delete <id>`, and `sudo lsof -i :3000` followed by `sudo kill <PID>`.
*   **`curl: (7) Failed to connect`:** Double-checked Security Group rules for port 3000 (backend) and 5173 (frontend), ensured the backend/frontend PM2 processes were running (`pm2 list`), and verified the correct public IP was being used. Tested connectivity locally on EC2 first (`curl http://localhost:3000/...`).
*   **`nodemon: command not found` (backend):** Changed `dev` script in `backend/package.json` to use `node server.js` as PM2 handles restarts. Alternatively, `sudo npm install -g nodemon` could have been used.
*   **`serve: Permission denied` (frontend):** Used `chmod +x /path/to/frontend/node_modules/.bin/serve` or reinstalled local dependencies in the `frontend` directory.
*   **`curl: (3) unmatched close brace/bracket`:** Ensured proper shell quoting for the `curl -d` payload, especially if it contained special characters like `!`. Used double quotes for the payload and escaped inner double quotes (e.g., `-d "{\"data\": \"text with !\"}"`).