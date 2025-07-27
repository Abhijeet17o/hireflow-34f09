@echo off
echo Setting up GitHub repository for HireFlow...
echo.

echo Please follow these steps:
echo.
echo 1. Go to https://github.com and create a new repository named 'hireflow'
echo 2. Make it PUBLIC so you can share the link
echo 3. DON'T initialize with README, .gitignore, or license
echo 4. After creating, come back here and press any key to continue...
echo.
pause

echo.
echo Now we'll connect your local repository to GitHub...
echo.

set /p username="Enter your GitHub username: "

echo.
echo Adding GitHub remote...
git remote add origin https://github.com/%username%/hireflow.git

echo.
echo Renaming branch to main...
git branch -M main

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo SUCCESS! Your repository is now on GitHub at:
echo https://github.com/%username%/hireflow
echo.
echo Next steps:
echo 1. Go to netlify.com
echo 2. Click "New site from Git"
echo 3. Connect your GitHub repository
echo 4. Deploy!
echo.
echo Your live site will be at: https://your-site-name.netlify.app
echo.
pause
