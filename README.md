# Welcome to OnSpace AI

Onspace AI empowers anyone to turn ideas into powerful AI applications in minutes—no coding required. Our free, no-code platform enables effortless creation of custom AI apps; simply describe your vision and our agentic AI handles the rest. The onspace-app, built with React Native and Expo, demonstrates this capability—integrating popular third-party libraries to deliver seamless cross-platform performance across iOS, Android, and Web environments.

## Getting Started

### 1. Environment Variables

Create a `.env` file in the repo root (not committed; see `.gitignore`) and set:

```
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key
# Optional
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
```

Alternatively, you can use `app.json`/`app.config.js` or Expo Secrets for managed env.

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Start the Project

- Start the development server (choose your platform):

```bash
npm run start         # Start Expo development server
npm run android       # Launch Android emulator
npm run ios           # Launch iOS simulator
npm run web           # Start the web version
```

- Reset the project (clear cache, etc.):

```bash
npm run reset-project
```

### 4. Lint the Code

```bash
npm run lint
```

## Main Dependencies

- React Native: 0.73.6
- React: 18.2.0
- Expo: ~53.0.12
- Expo Router: ~5.1.0
- Supabase: ^2.50.0
- Other commonly used libraries:  
  - @expo/vector-icons  
  - react-native-paper  
  - react-native-calendars  
  - lottie-react-native  
  - react-native-webview  
  - and more

For a full list of dependencies, see [package.json](./package.json).

## Development Tools

- TypeScript: ~5.8.3
- ESLint: ^9.25.0
- @babel/core: ^7.25.2

## Contributing

1. Fork this repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is private ("private": true). For collaboration inquiries, please contact the author.

---

## Security and Push Protection

This repo has GitHub Push Protection enabled. If a push is blocked for secrets:

1. Remove the secret from the code (use environment variables instead).
2. Rewrite or amend the commit to remove the secret from history:

```
# If the secret was only in the last commit
git commit --amend --no-edit
git push --force-with-lease

# For earlier commits (interactive rebase to edit offending commit)
# Replace N with the number of commits to inspect
git rebase -i HEAD~N  # mark the bad commit as edit
# After it pauses: edit the file(s) to remove the secret
git add -A
git commit --amend --no-edit
git rebase --continue

git push --force-with-lease
```

If GitHub still flags the push, follow the unblock link shown in the error only if the secret is a false positive or already revoked.
