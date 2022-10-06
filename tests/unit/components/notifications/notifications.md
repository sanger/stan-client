# Notifications

- PromptOnLeave.tsx
- WarningToast.tsx

Since these components rely on external libraries to render and only render as a consequence of other components,
they are tricky to isolate and test. Testing them within other components is probably the best way.
