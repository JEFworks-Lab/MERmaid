clone

To install after cloning and start development server
```
npm install
npm start
```

To build for release
```
npm run-script build
```

To just run without installation
```
cd build
# Check python version
python -V
# If Python version returned above is 3.X
python -m http.server 8080
# If Python version returned above is 2.X
python -m SimpleHTTPServer 8080
```

Then point your browser to http://localhost:8080/

