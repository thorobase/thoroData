thorobase.thorodata.BRISImportChartData = Object.create(thorobase.thorodata.Provider);

// the config object represents the static data used by BRIS 
// for the BRIS Import Chart Data files
thorobase.thorodata.BRISImportChartData.config = {

	surfaces: {
		"D": "Dirt",
		"T": "Turf",
		"d": "Dirt-Inner",
		"t": "Turf-Inner",
		"s": "Steeplechase",
		"h": "Hurdle"
	},
	raceTypes: {
		"G": "Graded Stk/Hcp",
		"N": "Non-Graded Stk/Hcp",
		"A": "Allowance",
		"AO": "Allowance Optional Claiming",
		"R": "Starter Allowance",
		"T": "Starter Hcp",
		"C": "Claiming",
		"CO": "Optional Claiming",
		"S": "Mdn Sp Wt",
		"M": "Mdn Claiming",
		"MO": "Maiden Optional Claiming",
		"NO": "Optional Claiming Stk"
	},
	raceGrades: [
		"Not Graded", 
		"Grade I", 
		"Grade II", 
		"Grade III", 
		"", 
		"Grade I Canada", 
		"Grade II Canada", 
		"Grade III Canada"
	],
	ageSexRestrCode1: {
		"A": {
			"desc": "2 year olds",
			"shortDesc": "2yo"
		}, 
		"B": {
			"desc": "3 year olds",
			"shortDesc": "3yo"
		},
		"C": {
			"desc": "4 year olds",
			"shortDesc": "4yo"
		},
		"D": {
			"desc": "5 year olds",
			"shortDesc": "5yo"
		},
		"E": {
			"desc": "3 & 4 year olds",
			"shortDesc": "3&4yo"
		},
		"F": {
			"desc": "4 & 5 year olds",
			"shortDesc": "4&5yo"
		},
		"G": {
			"desc": "3, 4 & 5 year olds",
			"shortDesc": "3-5yo"
		},
		"H": {
			"desc": "All ages",
			"shortDesc": "2yo+"
		}
	},
	ageSexRestrCode2: {
		"O": {
			"desc": "That age only",
			"shortDesc": ""
		},
		"U": {
			"desc": "That age and up",
			"shortDesc": "+"
		}
	},
	ageSexRestrCode3: {
		"N": {
			"desc": "No sex restrictions",
			"shortDesc": ""
		},
		"M": {
			"desc": "Mares and Fillies Only",
			"shortDesc": "F&M"
		},
		"C": {
			"desc": "Colts and/or Geldings Only",
			"shortDesc": "C&G"
		},
		"F": {
			"desc": "Fillies Only",
			"shortDesc": "F"
		}
	},
	statebredFlag: 1,
	entryCouplingFlag: "e",
	didNotFinishFlag: 92,
	medicationCodes: [
		"None",
		"Lasix",
		"Bute",
		"Bute & Lasix"
	],
	blinkeredFlag: "b",
	// these arrays contain the column numbers related to just 
	// thorobase.thorodata.RaceCard, thorobase.thorodata.Race and thorobase.thorodata.Performance data respectively
	raceCardCols: [0, 1],
	raceCols: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 47],
	perfCols: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]

};

/**
 * Parse the BRIS Import Chart Data, contained within the Google Visualization DataTable object,
 * into an array of thorobase.thorodata.RaceCard objects
 */
thorobase.thorodata.BRISImportChartData.parseRaceCards = function (/* google.visualization.DataTable */ data) {
	var raceCards, raceCard, BRISImportChartDataRaceCards, raceCardIndex, raceDateCYMD;

	// group the data by the columns relating just to thorobase.thorodata.RaceCard data
	raceCards = google.visualization.data.group(data, this.config.raceCardCols, []);

	BRISImportChartDataRaceCards = [];
	
	// for each race card, create a thorobase.thorodata.RaceCard object, populate the data fields
	// and add it to the BRISImportChartDataRaceCards array
	for (raceCardIndex = 0; raceCardIndex < raceCards.getNumberOfRows(); raceCardIndex += 1) {
		raceCard = Object.create(thorobase.thorodata.RaceCard);
				
		raceCard.track = raceCards.getFormattedValue(raceCardIndex, 0) || null;
		
		raceDateCYMD = raceCards.getFormattedValue(raceCardIndex, 1);
		raceCard.raceDate = {};
		raceCard.raceDate.year = raceDateCYMD.substring(0, 4) || null;
		raceCard.raceDate.month = raceDateCYMD.substring(4, 6) || null;
		raceCard.raceDate.day = raceDateCYMD.substring(6) || null;
		
		raceCard.races = [];
		
		BRISImportChartDataRaceCards.push(raceCard);
	}
	
	return BRISImportChartDataRaceCards;
};

/**
 * Parse the BRIS Import Chart Data, contained within the Google Visualization DataTable object, 
 * of the selected thorobase.thorodata.RaceCard into an array of thorobase.thorodata.Race objects
 */
thorobase.thorodata.BRISImportChartData.parseRaces = function (/* google.visualization.DataTable */data, /* thorobase.thorodata.RaceCard */ raceCard) {
	var raceCardView, raceCardRaces, races, raceIndex, race, raceRunDateCYMD, distanceVal, surfaceCode, raceTypeCode, raceGradeCode, ageSexRestrDesc, ageSexRestrCode, raceAgeSexRestrArray, racePointsOfFractionals, fractionalsIndex, fractional;
	
	raceCardView = new google.visualization.DataView(data);
	
	// filter the View by track and card date
	raceCardView.setRows(
		data.getFilteredRows([
			{column: 0, value: raceCard.track}, 
			{column: 1, value: raceCard.getRaceDateCYMD()}
		])
	);
	
	// group the View by the columns that contain just pertinent race data		
	raceCardRaces = google.visualization.data.group(raceCardView, this.config.raceCols, []);
		
	races = [];
	
	// for each race, create a thorobase.thorodata.Race object, populate the data fields
	// and add it to the races array
	for (raceIndex = 0; raceIndex < raceCardRaces.getNumberOfRows(); raceIndex += 1) {
		race = Object.create(thorobase.thorodata.Race);
		
		race.raceTrack = raceCardRaces.getValue(raceIndex, 0);
		
		raceRunDateCYMD = raceCardRaces.getFormattedValue(raceIndex, 1);
		race.raceRunDate = {};
		race.raceRunDate.year = raceRunDateCYMD.substring(0, 4) || null;
		race.raceRunDate.month = raceRunDateCYMD.substring(4, 6) || null;
		race.raceRunDate.day = raceRunDateCYMD.substring(6) || null;
		
		race.raceNumber = raceCardRaces.getValue(raceIndex, 2) || null;
		
		distanceVal = raceCardRaces.getValue(raceIndex, 3);
		race.distance = {};
		race.distance.unit = "yards";
		race.distance.value = Math.abs(distanceVal) || null;
		race.distance.isAbout = (distanceVal < 0) ? true : false;
		
		surfaceCode = raceCardRaces.getFormattedValue(raceIndex, 4);
		race.surface = {};
		race.surface.code = surfaceCode || null;
		race.surface.desc = this.config.surfaces[surfaceCode] || null;
		race.surface.condition = raceCardRaces.getFormattedValue(raceIndex, 16) || null;
		
		raceTypeCode = raceCardRaces.getFormattedValue(raceIndex, 5);
		race.raceType = {};
		race.raceType.code = raceTypeCode || null;
		race.raceType.desc = this.config.raceTypes[raceTypeCode] || null;
		race.raceType.classRaceName = raceCardRaces.getFormattedValue(raceIndex, 17) || null;
		
		raceGradeCode = raceCardRaces.getValue(raceIndex, 6);
		race.raceGrade = {};
		race.raceGrade.code = raceGradeCode || 0;
		race.raceGrade.desc = this.config.raceGrades[raceGradeCode] || null;
		
		race.purse = {};
		race.purse.unit = "USD";
		race.purse.total = raceCardRaces.getValue(raceIndex, 7) || 0;
		
		// get the age and sex restriction details for this race
		// use the BRIS config data to describe the race conditions in further detail
		ageSexRestrDesc = [];
		ageSexRestrCode = raceCardRaces.getFormattedValue(raceIndex, 8);
		raceAgeSexRestrArray = ageSexRestrCode.split("");
		ageSexRestrDesc[0] = this.config.ageSexRestrCode1[raceAgeSexRestrArray[0]].desc || null;
		ageSexRestrDesc[1] = this.config.ageSexRestrCode2[raceAgeSexRestrArray[1]].desc || null;
		ageSexRestrDesc[2] = this.config.ageSexRestrCode3[raceAgeSexRestrArray[2]].desc || null;
		race.ageSexRestr = {};
		race.ageSexRestr.code = ageSexRestrCode || null;
		race.ageSexRestr.desc = ageSexRestrDesc || null;
		race.ageSexRestr.shortDesc = (
			this.config.ageSexRestrCode1[raceAgeSexRestrArray[0]].shortDesc +
			this.config.ageSexRestrCode2[raceAgeSexRestrArray[1]].shortDesc +
			this.config.ageSexRestrCode3[raceAgeSexRestrArray[2]].shortDesc
		);
		
		race.isStatebred = (raceCardRaces.getValue(raceIndex, 9) === this.config.statebredFlag ? true : false);
		
		// get the Points of Fractional calls relevant to the distance of this race
		racePointsOfFractionals = thorobase.Equibase.pointsOfFractionals[race.distance.value];
		race.fractions = [];
		
		// for each fractional position, mark the distance of the point of fractional, 
		// the fractional time for the lead horse and the split time (noting distance traveled 
		// at the start of the split) between the time of this fraction and the previous fraction
		for (fractionalsIndex = 0; fractionalsIndex < racePointsOfFractionals.length; fractionalsIndex += 1) {
			
			// if there is a point of fractional at this point of the race, and
			// there is data relating to this point of fractional in the race data
			if (racePointsOfFractionals[fractionalsIndex] && raceCardRaces.getValue(raceIndex, (10 + fractionalsIndex)) ) {
				
				// construct the fractional object plus fractional split time data
				fractional = {
					
					// the distance traveled at this point of fractional
					pofDist: racePointsOfFractionals[fractionalsIndex],
					
					// the fractional time at this point of fractional
					pofTime: raceCardRaces.getValue(raceIndex, (10 + fractionalsIndex)),
					
					// if this is the first fraction, use 0 as the distance traveled at the start of this fraction
					// else use the distance traveled at the end of the previous fraction
					splitStart: fractionalsIndex === 0 ? 0 : fractional.pofDist,
					
					// if this is the first fraction, use 0 as the fractional time at the start of this fraction
					// else use the fractional time traveled at the end of the previous fraction
					splitTime: fractionalsIndex === 0 ? raceCardRaces.getValue(raceIndex, (10 + fractionalsIndex)) : +( raceCardRaces.getValue(raceIndex, (10  + fractionalsIndex)) - fractional.pofTime ).toFixed(2)
					
				};
				
				race.fractions.push(fractional);
			}
		}
		
		race.performances = [];
		
		races.push(race);
	}

	return races;
};

/**
 * Parse the BRIS Import Chart Data, contained within the Google Visualization DataTable object, 
 * of the selected thorobase.thorodata.Race into an array of thorobase.thorodata.Performance objects
 */
thorobase.thorodata.BRISImportChartData.parsePerformances = function (/* google.visualization.DataTable */ data, /* thorobase.thorodata.Race */ race) {
	var raceView, perfCols, racePerfs, performances, perfIndex, perf, racePointsOfCall, callPosIndex, callPos;

	// create a DataView on all the race data and filter it to just the race selected
	raceView = new google.visualization.DataView(data);
	raceView.setRows(
		data.getFilteredRows([
			{column: 0, value: race.raceTrack}, 
			{column: 1, value: race.getRaceRunDateCYMD()},
			{column: 2, value: race.raceNumber}
		])
	);
	
	perfCols = this.config.perfCols;
	
	// group the race data in the selected columns that relate just to the performances in this race
	racePerfs = google.visualization.data.group(raceView, perfCols, []);
	
	performances = [];
	
	// for each performance, create a thorobase.thorodata.Performance object, populate it with the data
	for (perfIndex = 0; perfIndex < racePerfs.getNumberOfRows(); perfIndex += 1) {
		perf = Object.create(thorobase.thorodata.Performance);
		
		perf.pp = racePerfs.getValue(perfIndex, 0) || null;
		
		// if this column's value is equal to the Coupled Entry flag, 
		// then this horse was part of a entry coupled for betting purposes
		perf.isEntryCoupled = (racePerfs.getFormattedValue(perfIndex, 1) === this.config.entryCouplingFlag ? true : false);
		
		perf.horseName = racePerfs.getFormattedValue(perfIndex, 2) || null;
		perf.countryCode = racePerfs.getFormattedValue(perfIndex, 3) || "USA";
		perf.yearOfBirth = racePerfs.getValue(perfIndex, 4) || null;
		perf.weight = racePerfs.getValue(perfIndex, 5) || null;
		perf.claimingPrice = racePerfs.getValue(perfIndex, 6) || 0;
		
		// get the Points of Call relevant to the distance of this race
		racePointsOfCall = thorobase.Equibase.pointsOfCall[race.distance.value];
		perf.callPositions = [];
		
		// for each call position, mark the distance of the point of call, the position in the field for this horse
		// and the cumulative lengths behind the leader this horse was at this point of call
		for (callPosIndex = 0; callPosIndex < racePointsOfCall.length; callPosIndex += 1) {
			
			// if there is a point of call at this point of the race, and
			// there is data relating to this point of call in the race data
			if (racePointsOfCall[callPosIndex] && racePerfs.getValue(perfIndex, (7 + callPosIndex)) ) {
				
				// construct an object representing the call positions
				callPos = {
					
					// the distance traveled at this point of fractional
					pocDist: racePointsOfCall[callPosIndex],
					
					// the race position of the horse at this point of call
					pocPos: racePerfs.getValue(perfIndex, (7 + callPosIndex)),
					
					// the culmulative number of lengths this horse is behind the leader at this point of call
					pocLengths: racePerfs.getValue(perfIndex, (13 + callPosIndex)) || 0,
					
					// this value represents the 'running lane' (think of an athletics track) the horse was in at this point of call
					// a pocWide value of 1 equates to the horses running against the rail; a value of 3 means 'three body widths off the rail',
					// often shortened in commentary to 'three wide'. As the BRIS Import Chart Data does not contain how 'wide' the horses
					// were at each point of call, a default value of the respective Post Position (PP) is used instead
					pocWide: perf.pp
				};

				perf.callPositions.push(callPos);
			}
			
		}	
		
		// if the horse's call position at the finish line equals the DNF flag, the horse did not finish the race
		perf.didNotFinish = (perf.callPositions[(perf.callPositions.length - 1)] === this.config.didNotFinishFlag) ? true : false;
		
		// odds are to $1		
		perf.odds = racePerfs.getValue(perfIndex, 19) || 0;
		
		medsCode = racePerfs.getValue(perfIndex, 20);
		perf.medication = {};
		perf.medication.code = medsCode || 0;
		perf.medication.desc = this.config.medicationCodes[medsCode] || null;
		
		// true if the horse was wearing blinkers
		perf.blinkered = (racePerfs.getFormattedValue(perfIndex, 21) === this.config.blinkeredFlag ? true : false);
		
		perf.trainerName = racePerfs.getFormattedValue(perfIndex, 22) || null;
		perf.jockeyName = racePerfs.getFormattedValue(perfIndex, 23) || null;
		perf.ownerName = racePerfs.getFormattedValue(perfIndex, 24) || null;
				
		lastRaceDateCYMD = racePerfs.getFormattedValue(perfIndex, 25);
		perf.lastRace = {};
		perf.lastRace.raceRunDate = {};
		perf.lastRace.raceRunDate.year = lastRaceDateCYMD.substring(0, 4) || null;
		perf.lastRace.raceRunDate.month = lastRaceDateCYMD.substring(4, 6) || null;
		perf.lastRace.raceRunDate.day = lastRaceDateCYMD.substring(6) || null;
		perf.lastRace.raceTrack = racePerfs.getFormattedValue(perfIndex, 26) || null;
		perf.lastRace.raceNumber = racePerfs.getValue(perfIndex, 27) || null;
		perf.lastRace.raceSession = racePerfs.getValue(perfIndex, 28) || 0;
		perf.lastRace.pp = racePerfs.getValue(perfIndex, 29) || null;
		
		performances.push(perf);
	}
	
	return performances;

};

thorobase.thorodata.BRISImportChartData.getRawData = function (/* String */ dataSourceUrl, /* String */ queryString, /* function */ callBack) {
	var query;

	query = new google.visualization.Query(dataSourceUrl);

	if (queryString) {
		query.setQuery(queryString);
	} else {
		query.setQuery("SELECT *");
	}

	query.send(callBack);
},

thorobase.thorodata.BRISImportChartData._setRawData = function (/* google.visualization.QueryResponse */ response) {
	if (response.isError()) {
		alert("Error in query: " + response.getMessage() + " " + response.getDetailedMessage());
		return;
	}
	
	// get the raw data from the query response
	this.rawData = response.getDataTable();
}