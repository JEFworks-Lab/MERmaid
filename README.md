# MERmaid

![mermaid logo](mermaid_logo.svg)

WebGL-based viewer for MERFISH data

## Online Demo: 
[https://jef.works/MERmaid/](https://jef.works/MERmaid/)

![mermaid demo](mermaid_demo.gif)

## Download

### Clone repo
```
git clone https://github.com/JEFworks/MERmaid.git
cd MERmaid
```

## Re-build

### Install after cloning and start development server
```
npm install
npm start
```

### Build for release
```
npm run-script build
```

### Optional renaming for Github purposes
```
cp -r build/ docs/
## rename homepage paths in build if needed
```

## Run without re-building
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
Alternatively http://127.0.0.1:8080/

## Using your own data

Replace the `data.csv.gz` file in the build/ folder and follow the `Run without re-building` steps above. 