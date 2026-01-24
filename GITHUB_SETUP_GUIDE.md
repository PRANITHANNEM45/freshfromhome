# GitHub Setup Guide for FreshFromFarm

## Step 1: Install Git (if not already installed)

1. Download Git from: https://git-scm.com/download/win
2. Run the installer with default settings
3. Restart your terminal/PowerShell after installation

## Step 2: Configure Git (First Time Setup)

Open Git Bash or PowerShell and run:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Initialize Git Repository

Navigate to your project folder and run:

```bash
cd d:\pranithannem-projects\freshfromfarm
git init
```

## Step 4: Add All Files

```bash
git add .
```

## Step 5: Create Initial Commit

```bash
git commit -m "Initial commit: FreshFromFarm Dairy Management System"
```

## Step 6: Create GitHub Repository

1. Go to https://github.com
2. Click the **"+"** icon in the top right
3. Select **"New repository"**
4. Repository name: `freshfromfarm` (or your preferred name)
5. Description: "Dairy Sales & Management System"
6. Choose **Private** or **Public**
7. **DO NOT** initialize with README, .gitignore, or license (we already have these)
8. Click **"Create repository"**

## Step 7: Link Local Repository to GitHub

After creating the repository on GitHub, you'll see commands. Use these:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/freshfromfarm.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## Alternative: Using GitHub Desktop

If you prefer a GUI:

1. Download GitHub Desktop: https://desktop.github.com/
2. Install and sign in with your GitHub account
3. Click **"Add"** → **"Add Existing Repository"**
4. Browse to: `d:\pranithannem-projects\freshfromfarm`
5. Click **"Publish repository"** to push to GitHub

## Step 8: Verify Upload

1. Go to your GitHub repository URL
2. You should see all your files uploaded
3. Check that README.md displays properly

## Future Updates

After making changes, use these commands:

```bash
# Check what changed
git status

# Add all changes
git add .

# Commit with a message
git commit -m "Description of your changes"

# Push to GitHub
git push
```

## Important Notes

- ✅ `.gitignore` is already configured
- ✅ `README.md` is already created
- ✅ `PROJECT_SNAPSHOT.md` documents your tech stack
- ⚠️ Make sure to create `.env` files locally (they won't be pushed to GitHub)
- ⚠️ Never commit sensitive data like passwords or API keys

## Troubleshooting

### "Git is not recognized"
- Restart your terminal after installing Git
- Or use Git Bash instead of PowerShell

### Authentication Issues
- GitHub may require a Personal Access Token (PAT) instead of password
- Create one at: https://github.com/settings/tokens
- Use the token as your password when pushing

### Permission Denied
- Make sure you're logged into the correct GitHub account
- Check repository permissions

---

**Need Help?** Feel free to ask for assistance with any step!
