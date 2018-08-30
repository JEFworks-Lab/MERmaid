# MERmaid

![mermaid logo](mermaid_logo.svg)

WebGL-based viewer for MERFISH data

## Online Demo: 
[https://jef.works/MERmaid/](https://jef.works/MERmaid/)

![mermaid demo](mermaid_demo.gif)

## To run locally

```
# Clone repo
git clone https://github.com/JEFworks/MERmaid.git

# Go into folder
cd MERmaid

# Check python version
python -V

# If Python version returned above is 3.X
python -m http.server
# If Python version returned above is 2.X
python -m SimpleHTTPServer
```

Then point your browser to http://localhost:8000/

## Data format

[]()Filename | []()Description
|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `data.csv.gz`  | Each line is a point. Column are x, y, and z coordinates if appropriate. Remaining columns are categorical metadata/annotations such as genes. Columns must have unique names. App automatically creates selection options based on columns.|

Sample data included is from [Guiping Wang et al. (Nature Scientific Reports, 2018)](https://www.nature.com/articles/s41598-018-22297-7).

```
> zless data.csv.gz
x,y,gene1,gene2
-996.7849,-931.8804,ADAM9,ADAM9
-957.2759,-930.179,ADAM9,ADAM9
-956.5011,-994.9382,ADAM9,ADAM9
```
