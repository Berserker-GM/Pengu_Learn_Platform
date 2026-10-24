# Pengu: your desktop coding mentor (Windows 10/11)

Pengu is a small penguin that lives on your desktop. While you practice coding, it watches your work and asks short
questions, like an interviewer would. It never hands you the answer.

## Before you start
1. Install **Visual Studio Code**: https://code.visualstudio.com/
   In the installer, keep **"Add to PATH"** ticked. This lets Pengu open VS Code for you.
2. Optional: install the language you want to practice (Python, Node.js, Go or Java). You can read and edit the lessons without it.

## Run Pengu
1. Right-click `Pengu-win.zip` and choose **Extract All** (for example to your Desktop).
2. Open the extracted folder and double-click `Pengu.exe`.
3. Windows may show **"Windows protected your PC"**. This happens because the app is not code-signed yet.
   Click **More info**, then **Run anyway**.
4. A penguin appears on your desktop. You can drag it anywhere.

## Start learning
1. **Click the penguin.** The dashboard opens.
2. Pick a course (**DSA Interview Prep** or **System Design Basics**) and press **Start**.
3. VS Code opens your own copy of the course, stored in `C:\Users\<you>\PenguLearn`.
   Your edits are kept: pressing Start again never overwrites your work.
   The first time, Pengu also installs its small helper extension into VS Code.
4. Open a lesson folder and read its `README.md`. Pick ONE language file and fill in the TODO.
5. Code as you normally would. After a few seconds of typing (or when you hit an error) Pengu may pop up a question
   in a speech bubble. Think about it, then keep going.
6. The dashboard shows your progress per course. The **Progress** page lists your recurring mistakes and what to practice next.

## Privacy
- There is no account. Pengu creates an anonymous random ID on your computer.
- Only files inside your Pengu course folders are watched, and only while they are open in VS Code.
  The text of those files (up to 20,000 characters) and VS Code's error messages are sent to the Pengu server so an AI can review them.
- Do not paste passwords, keys or personal data into course files.

## Trouble?
- **"VS Code not found"**: install it (see above), then restart Pengu.
- **No bubbles for a minute**: the server may be waking up. This can take up to a minute the first time. Keep coding.
- **Still nothing**: in VS Code open **View > Output**, choose **Pengu** in the dropdown and look for the last lines.
  Check that Pengu is running (the penguin is visible on the desktop).
- **Penguin disappeared**: start `Pengu.exe` again.
