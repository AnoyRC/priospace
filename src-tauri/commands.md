## Mac Permission Command

```bash
sudo chown -R $(whoami) .
```

## Mac Build Command

```bash
npx tauri build --target universal-apple-darwin --config src-tauri/tauri.appstore.conf.json
```

## Mac Sign Command

```bash
xcrun productbuild --sign "3rd Party Mac Developer Installer: Anoy Roy Chowdhury (AU333QNGKA)" --component "src-tauri/target/universal-apple-darwin/release/bundle/macos/priospace.app" /Applications "priospace.pkg"
```