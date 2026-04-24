# Deploy This Portfolio

This project is already prepared for GitHub Pages.

## Fastest path

1. Log into GitHub on this machine:

```powershell
gh auth login
```

2. Create a new GitHub repo and push this project:

```powershell
gh repo create portfolio-project --public --source . --remote origin --push
```

3. In GitHub, open the repo:
- `Settings`
- `Pages`
- ensure `GitHub Actions` is selected as the source if prompted

4. Push any future changes:

```powershell
git add .
git commit -m "Update portfolio"
git push
```

## Result

After the first push and workflow run, GitHub Pages will publish the site automatically.

The URL will usually look like:

```text
https://<your-github-username>.github.io/portfolio-project/
```

If you want a custom domain later, you can add it in GitHub Pages settings.
