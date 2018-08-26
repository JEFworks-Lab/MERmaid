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
| `data.csv`  | Each line is a point. First column is x coordinate, second column is y coordinate. Remaining columns are categorical metadata/annotations such as genes. |
| `genes.csv` | Each column is the set of options available for each metadata/annotation ie. all the genes assayed.                                                      |

