const express = require('express')
const app = express()
const handlebars = require('express-handlebars')
const fetch = require('node-fetch');
const { performance } = require('perf_hooks');
let fs = require("fs");

let Logger = (exports.Logger = {});

let errorStream = fs.createWriteStream("logs/error.txt");

Logger.error = function (msg) {
	var message = new Date().toISOString() + " : " + msg + "\n";
	errorStream.write(message);
};

const host = '127.0.0.1'
const port = 3000

app.use(express.static("public"));

app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('views', './views')
app.set('view engine', 'handlebars')

app.get('/', (req, res) => {
	// Start of the fetch request time
	let start = performance.now();
	let end;
	let startSec;
	let endSec;
	let dinamicData;
	let nonImportantData;
	fetch('http://slowpoke.desigens.com/json/1/7000')
		.then(res => res.json())
		.then(data => {
			dinamicData = {
				postData: data,
				failed: false,
				nonImp: null,
				nonImpFailed: false
			}
			// End of fetch request time
			end = performance.now();
			waitRender();
		}).catch(err => console.error(err));

	function waitRender() {
		if (end - start < 6000) {
			startSec = performance.now();
			fetch('http://slowpoke.desigens.com/json/2/3000')
				.then(res => res.json())
				.then(data => {
					nonImportantData = data;
					endSec = performance.now();
					if (endSec - startSec > end - start) {
						dinamicData.nonImp = nonImportantData
					} else {
						dinamicData.nonImpFailed = true
						Logger.error("Could not fetch phrases on time");
					}
					renderData();
				}).catch(err => console.error(err));
		} else {
			dinamicData.failed = true;
			renderData();
			Logger.error("Could not fetch news on time");
		}
	}

	function renderData() {
		res.render('home', dinamicData)
	}
})

app.listen(port, host, function () {
	console.log(`Server listens http://${host}:${port}`)
})

