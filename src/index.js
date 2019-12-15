import React from 'react';
import ReactDOM from 'react-dom';
import reactCSS from 'reactcss'
import DeckGL, {ScatterplotLayer, PolygonLayer, COORDINATE_SYSTEM, OrthographicView} from 'deck.gl';
import { SketchPicker } from 'react-color';
import pako from 'pako';
import * as d3 from 'd3';
//import * as convexHull from './hull.js';
import BitmapLayer from './bitmap-layer.js';

const IMAGES = {
    BG: 'bg.png',
};
const DATA_URL = 'data.csv.gz'

function toRadians(degrees) {
    function toRadian(degree) {
	return (Math.PI * degree) / 180;
    }
    return degrees.map(d => toRadian(d));
}

function updateTooltip({x, y, object}) {
    const tooltip = document.getElementById('tooltip');

    if (object) {
	tooltip.style.top = `${y}px`;
	tooltip.style.left = `${x}px`;
	tooltip.innerHTML = `
	    <div><div>${object[2]}</div></div>
	    `;
    } else {
	tooltip.innerHTML = '';
    }
}

export class MERmaid extends React.Component {
    constructor(props) {
	super(props);
	this.state = {
	    data: [],
	    //hull: [],
	    header: ['x','y','gene0'],
	    options: ['gene0'],
	    options_selections: {'gene0':['a','b','c']},
	    origin: [0, 0, 0],
	    num_points: 0,
	    
	    SELECTED: {'gene0':''},
	    SELECTED_COLOR: {'gene0':[0, 128, 255]},
	    BG_COLOR: [80, 80, 80, 80],
	    RADIUS: 1,
	    NUMGENES: 0 // number of extra genes (start at 0 for easy indexing)	   
	};

	this.loadData();
	this.updateSelectedColor = this.updateSelectedColor.bind(this);
	this.updateSelection = this.updateSelection.bind(this);
	this.updateRadius = this.updateRadius.bind(this);
	
	this.increaseNumGenes = this.increaseNumGenes.bind(this);
	this.decreaseNumGenes = this.decreaseNumGenes.bind(this);
    }

    updateRadius(rad) {
	console.log('UPDATING RADIUS')
	console.log(rad.target.value)
	this.setState({ RADIUS: Number(rad.target.value) });
    }
    updateSelectedColor(color, id) {
	console.log('UPDATING COLOR')
	console.log(id)
	console.log(color)
	var temp = this.state.SELECTED_COLOR
	temp[id] = color
	this.setState({ SELECTED_COLOR: temp });
    }
    updateSelection(opt, id) {
	console.log('UPDATING SELECTION')
	console.log(id)
	console.log(opt.target.value)
	var temp = this.state.SELECTED
	temp[id] = opt.target.value
	this.setState({ SELECTED: temp });
    }
    increaseNumGenes() {
	if(this.state.NUMGENES < 10) {
	    console.log('INCREASING GENE SELECTION')
	    var ng = this.state.NUMGENES + 1
	    console.log(ng)

	    var tempOptions = this.state.options
	    var tempOptionsSelections = this.state.options_selections	    
	    var tempSelected = this.state.SELECTED
	    var tempSelectedColor = this.state.SELECTED_COLOR
	    tempOptions.push('gene'+ng)		
	    tempOptionsSelections['gene'+ng] = tempOptionsSelections['gene0'] // same gene list	
	    tempSelected['gene'+ng] = ''	    
	    tempSelectedColor['gene'+ng] = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]
	    	
	    this.setState({ options: tempOptions});
	    this.setState({ options_selections: tempOptionsSelections});
	    this.setState({ SELECTED: tempSelected});
	    this.setState({ SELECTED_COLOR: tempSelectedColor});	    
	    this.setState({ NUMGENES: ng });	
	}
    }
    decreaseNumGenes() {
	if(this.state.NUMGENES > 0) {
	    console.log('DECREASING GENE SELECTION')
	    var ng0 = this.state.NUMGENES
	    var ng = ng0 - 1
	    console.log(ng)

	    var tempOptions = this.state.options
	    var tempOptionsSelections = this.state.options_selections	    
	    var tempSelected = this.state.SELECTED
	    var tempSelectedColor = this.state.SELECTED_COLOR
	    tempOptions.splice(tempOptions.indexOf('gene'+ng0),1)
	    delete tempOptionsSelections['gene'+ng0]
	    delete tempSelected['gene'+ng0]
	    delete tempSelectedColor['gene'+ng0]
	    	
	    this.setState({ options: tempOptions});
	    this.setState({ options_selections: tempOptionsSelections});
	    this.setState({ SELECTED: tempSelected});
	    this.setState({ SELECTED_COLOR: tempSelectedColor});	    
	    this.setState({ NUMGENES: ng });	
	}
    }

    loadData() {
	var logTime = function(text) {
	    console.log('[' + new Date().toUTCString() + '] ' + text);
	}
	var fetch = function(data_url, callback) {
	    logTime('downloading data');
	    var oReq = new XMLHttpRequest();
	    oReq.open("GET", data_url, true);
	    oReq.responseType = "arraybuffer";
	    oReq.onload = function(oEvent) {
		var arrayBuffer = oReq.response;
		if (arrayBuffer) {
		    var byteArray = new Uint8Array(arrayBuffer); // Get the compressed data
		    byteArray = pako.inflate(byteArray) // Decompress the data
		    var s = new TextDecoder("utf-8").decode(byteArray) // Convert to string
		    callback(s)
		}
	    };
	    oReq.send(null);
	}

	var cb = function(data_string, mythis) {
	    logTime('parsing data');
	    
	    var data = d3.csvParseRows(
		data_string,
		(d, i) => {
		    return(d)
		}
	    )

	    logTime('setting data');
	    var header = data.splice(0,1)[0];
	    var options = header.filter(x => ['x', 'y', 'z'].indexOf(x) < 0 );
	    console.log(options)
	    
	    var opts = {};
	    d3.map(options, function(option) {
		var ops = [];
		var j = header.indexOf(option);
		for (var i = 0; i < data.length; i++) {
		    if (data[i][j] in ops) {
			ops[data[i][j]]++;
		    } else {
			ops[data[i][j]] = 1;
		    }
		}
		ops = Object.keys(ops).sort();
		opts[option] = [' '].concat(ops);
	    });
	    logTime('detected options');
	    console.log(opts);
	    
	    var originX = d3.mean(data.map((d) => parseInt(d[header.indexOf('x')])));
	    var originY = d3.mean(data.map((d) => parseInt(d[header.indexOf('y')])));
	    var originZ = d3.mean(data.map((d) => parseInt(d[header.indexOf('z')])));
	    if( originX === undefined) { originX = 0; }
	    if( originY === undefined) { originY = 0; }
	    if( originZ === undefined) { originZ = 0; }
	    var origin = [originX, originY, originZ]
	    logTime('detected origin');
	    console.log(origin)

	    var selected = {}
	    options.map((d) => {selected[d]=''})
	    var selectedColor = {}
	    options.map((d) => {selectedColor[d]=[Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]})

	    
	    // // get convex hull for each
	    // console.log('CONVEX HULLING CELLS')
	    // //var hull = convexHull(cells)
	    // var hull = d3.nest()
	    // 	.key(function(d) { return d[header.indexOf('cell')]; })
	    // 	.rollup(function(v) {
	    // 	    return convexHull(v.map(i => [
	    // 		parseInt(i[header.indexOf('x')]),
	    // 		parseInt(i[header.indexOf('y')])
	    // 	    ])
	    // 			     )
	    // 	})
	    // 	.entries(data);
	    // hull = hull.map(i => i.value);

	    mythis.setState({
		data: data,
		//hull: hull,
		header: header,
		options: options,
		options_selections: opts,
		origin: origin,
		num_points: data.length,
		SELECTED: selected,
		SELECTED_COLOR: selectedColor
	    })

	};

	var ccb = (mythis) => ( (data_string) => cb(data_string, mythis) )
	var foo = ccb(this)

	fetch(DATA_URL, foo);
    }

    renderLayers() {
	const {
	    data = this.state.data,
	    //hull = this.state.hull,
	    header = this.state.header,
	    options = this.state.options,
	    
	    numgenes = this.state.NUMGENES,
	    radius = this.state.RADIUS,
	    selectedColor = this.state.SELECTED_COLOR,
	    bgColor = this.state.BG_COLOR,
	    selectedOption = this.state.SELECTED,
	    
	} = this.props;	
	
	console.log('RENDERING LAYER')
	console.log(numgenes);
	console.log(options);
	console.log(selectedOption);
	console.log(selectedColor);

	// Helper functions
	function getColorHelper(d) {
	    var color = [0, 0, 0] // default
	    for(var i = 0; i <= numgenes; i++) {
		if(d[header.indexOf('gene0')] === selectedOption[options[i]]) {
		    color = selectedColor[options[i]]
		}
	    }
	    return(color)
	}
	function getRadiusHelper(d) {
	    var rad = 0 // default
	    for(var i = 0; i <= numgenes; i++) {
		if(d[header.indexOf('gene0')] === selectedOption[options[i]]) {
		    rad = 2
		}
	    }
	    return(rad)
	}
    
	return [
	    new BitmapLayer({
		coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
		id: 'bg-layer',
		images: Object.values(IMAGES),
		data: [
		    {
			imageUrl: IMAGES.BG,
			rotation: toRadians([0, 0, 0]),  
			center: this.state.origin,
			scale: 2000
		    }
		]
	    }),	    
	    // new PolygonLayer({
	    // 	id: 'cell-plot',
	    // 	data: hull,
	    // 	coordinateSystem: COORDINATE_SYSTEM.IDENTITY, 
	    // 	pickable: false,
	    // 	stroked: true,
	    // 	filled: true,
	    // 	getPolygon: d => d,
	    // 	getFillColor: [80, 80, 80, 50],
	    // 	getLineColor: [80, 80, 80, 80],
	    // 	getLineWidth: 1
	    // }),
	    new ScatterplotLayer({
		id: 'bg-gene-plot',
		data: data,
		coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
		getPosition: d => [parseFloat(d[header.indexOf('x')]), parseFloat(d[header.indexOf('y')]), parseFloat(d[header.indexOf('z')])],
		getColor: bgColor,
		getRadius: 1,
		radiusScale: radius,
		
		pickable: true,
		onHover: updateTooltip
	    }),
	    new ScatterplotLayer({
		id: 'gene-plot',
		data: data,
		coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
		getPosition: d => [parseFloat(d[header.indexOf('x')]), parseFloat(d[header.indexOf('y')]), parseFloat(d[header.indexOf('z')])],
		getColor: d => getColorHelper(d),
		getRadius: d => getRadiusHelper(d),
		radiusScale: radius,
		
		updateTriggers: {
		    getColor: [Object.values(selectedColor), Object.values(selectedOption)],
		    getRadius: [Object.values(selectedOption)]
		},

		pickable: false
	    })
	];
    }

    render() {
	const styles = reactCSS({
	    'default': {
		main: {
		    fontFamily: 'Helvetica, Arial, sans-serif',
		    fontSize: '14px',
		    background: `rgba(80,80,80,0.8)`,
		    padding: '10px',
		    width: '300px',
		    position: 'relative',
		    zIndex: '0'
		}
	    }
	})
	
	const {viewState,
	       view = [new OrthographicView({
		   controller: {
		       dragRotate: false,
		       dragPan: true
		   }
	       })]
 	      } = this.props;

	var menu = [];
	for (var i = 0; i <= this.state.NUMGENES; i++) {

	    var idd = 'gene'+i;
	    console.log(idd)
	    
 	    var menuString = <Menu
	    id= {idd}
	    options = { this.state.options_selections[idd] }
	    color= { this.state.SELECTED_COLOR[idd] }
	    onChangeColor= {(color) => this.updateSelectedColor( [ color.rgb.r, color.rgb.g, color.rgb.b ], idd) }
	    selected = { this.state.SELECTED[idd] }
	    onChangeSelect= {(selected) => this.updateSelection( selected, idd ) }	    
		/>;
	    menu.push(menuString)
	}

	return (
		<div>
	        <DeckGL
	    views={view}	    
	    viewState={viewState}
	    layers={this.renderLayers()}
	    initialViewState={{
		lookAt: this.state.origin,
		zoom: 1
	    }}
	        />
		<div style={ styles.main }>

		<div> points rendered: { this.state.num_points } </div>
		<div> genes highlighted:
	        <button onClick = {this.decreaseNumGenes}> - </button><button onClick={this.increaseNumGenes}> + </button> 
	        </div>
		<div> size: <input type="range" min="0.1" max="5" step="0.1" value={this.state.RADIUS} class="slider" onChange={(value) => this.updateRadius(value)}></input></div>
		
		<hr></hr>
		{menu}
	    
		<hr></hr>
		
		<a href="data.csv.gz"><button>Download Data</button></a>
		<a href="https://github.com/JEFworks/MERmaid"><button>Source Code</button></a>
		</div>

	    </div>
	);
    }
}

class Menu extends React.Component {    
    constructor(props) {
	super(props);
	this.state = {
	    displayColorPicker: false,
	};
    }

    handleClick = () => {
	this.setState({ displayColorPicker: !this.state.displayColorPicker })
    };

    handleClose = () => {
	this.setState({ displayColorPicker: false })
    };

    render() {
	const styles = reactCSS({
	    'default': {
		label: {
		    height: '18px',
		    padding: '2px',
		    display: 'inline-block',
		    marginRight: '4px'
		},
		color: {
		    position: 'relative',
		    width: '14px',
		    height: '14px',
		    marginTop: '2px',
		    marginBottom: '-2px',
		    borderRadius: '2px',
		    background: `rgb(${ this.props.color[0] }, ${ this.props.color[1] }, ${ this.props.color[2] })`,
		    display: 'inline-block',
		    cursor: 'pointer',
		    zIndex: '1',
		},
		popover: {
		    position: 'absolute',
		    zIndex: '2',
		},
		cover: {
		    position: 'fixed',
		    top: '0px',
		    right: '0px',
		    bottom: '0px',
		    left: '0px',
		},
	    },
	});

	return (
		<div id={ 'Menu'+this.props.id }>
		<span id={ 'Label'+this.props.id } style={ styles.label }> { this.props.id } </span>
	        
		<select id={ 'Option'+this.props.id } style={ styles.label } value={this.props.selected} onChange={ this.props.onChangeSelect }>
		{this.props.options.map((i) => {
		    return (<option value={i}>{i}</option>)
		})}
	    </select>
		
		<div id={ 'ColorPicker'+this.props.id } style={ styles.color } onClick={ this.handleClick } />
		{ this.state.displayColorPicker ? <div style={ styles.popover }>
		  <div style={ styles.cover } onClick={ this.handleClose }/>
		  <SketchPicker id={ 'SketchPicker'+this.props.id } color={ this.props.color } onChange={ this.props.onChangeColor } />
		  </div> : null }		
	    </div>
	);
    }
}

ReactDOM.render(
	<MERmaid />,
    document.getElementById('root')
);
