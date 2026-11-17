TEXT — PASSWORD-PROTECTED CHAT ROOMS
======================================

WHAT IT DOES
- Create a chat room with a password.
- Get a unique room URL such as https://your-site.example/room/<random-id>.
- Share the URL with your friend and send the password separately.
- Your friend opens the URL, enters their name and password, and joins.
- Text messages appear live for everyone in that room.
- The server checks the password; it is not stored as plain text (bcrypt hash).

RUN LOCALLY
1. Install Node.js 18 or newer.
2. Extract this ZIP.
3. Open a terminal in the extracted folder.
4. Run: npm install
5. Run: npm start
6. Open http://localhost:3000

MAKE IT AVAILABLE ON THE INTERNET
Deploy this Node.js app to a host that supports persistent disk and WebSockets
(for example, a suitable Render/Railway/Fly.io setup). Set the start command to:
  npm start
Use a persistent disk mounted to the app folder because room data is saved in
rooms.json. Configure HTTPS on the hosting provider. The provider gives you a
public base URL; room links will use that host automatically.

IMPORTANT LIMITATIONS / BEFORE PUBLIC LAUNCH
- This starter stores room metadata and recent messages in a local JSON file.
  Use a persistent disk. If you deploy multiple server instances, this simple
  file-based storage will not synchronize between instances.
- Anyone with BOTH the room link and password can join. Share them separately.
- A room's messages are visible to every participant who knows the room password.
- This starter does not include end-to-end encryption, user accounts, blocking,
  reporting, or moderation. Do not use it for sensitive/private personal data.
- Add room expiry, abuse controls, rate limiting, and a database before scaling.
- Keep the password at least 6 characters; a longer unique passphrase is safer.
