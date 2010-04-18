if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

// Single global namespace
var thorobase = {};

// thorodata namespace
thorobase.thorodata = {};

// Used to extract the race information from a DataTable of horse racing results from a racing data provider
thorobase.thorodata.Provider = {
	
	rawData: null,
	
	/*
	 * Fetch the raw horse racing data using a specified location URL, a query and/or a response callback function if needed
	 */
	getRawData: function (/* String */ dataSourceUrl, /* String */ queryString, /* function */ callBack) {
		// override this for data supplier specific parsing	
	},
	
	/*
	 * Designed to be used as an internal helper function to process the response to a request to fetch raw horse racing data 
	 */
	_setRawData: function (response) {
		// override this for data supplier specific parsing
	},
	
	/*
	 * Parses the details of a set of Races at a Track on a particular day into a Race Card
	 */
	parseRaceCards: function (rawData) {
		// override this for data supplier specific parsing
	},
	
	/* 
	 * Parses the details of one race on a Race Card into a Race
	 */
	parseRaces: function (rawData, /* thorobase.thorodata.RaceCard */ raceCard) {
		// override this for data supplier specific parsing
	},
	
	/*
	 * Parses the details of a record of a race horse's performance in a Race into a Performance
	 */
	parsePerformances: function (rawData, /* thorobase.thorodata.Race */ race) {
		// override this for data supplier specific parsing
	},
	
	/*
	 * Utility function to parse all details of a supplied racing data DataTable object
	 * returns Array of thorobase.thorodata.RaceCard objects
	 */
	parseAll: function (rawData) {
		var raceCards, raceCardIndex, raceCard, raceIndex, race;

		raceCards = this.parseRaceCards(rawData);

		for (raceCardIndex = 0; raceCardIndex < raceCards.length; raceCardIndex += 1) {
			raceCard = raceCards[raceCardIndex];

			raceCard.races = this.parseRaces(rawData, raceCard);

			for (raceIndex = 0; raceIndex < raceCard.races.length; raceIndex += 1) {
				race = raceCard.races[raceIndex];			
				raceCard.races[raceIndex].performances = this.parsePerformances(rawData, race);
			}
		}

		return raceCards;
	}
	
};

thorobase.thorodata.Meet = {
	meetName: null,
	meetStartDate: {
		year: null,
		month: null,
		day: null
	},
	meetEndDate: {
		year: null,
		month: null,
		day: null
	},
	raceCards: null
};

thorobase.thorodata.RaceCard = {
	track: null,
	raceDate: {
		year: null,
		month: null,
		day: null
	},
	races: null,
	getRaceDateCYMD: function () {
		return +(this.raceDate.year + "" + this.raceDate.month + "" + this.raceDate.day);
	}
};

thorobase.thorodata.Race = {
	raceTrack: null,
	raceRunDate: {
		year: null,
		month: null,
		day: null
	},
	raceNumber: null,
	raceStartTime: null,
	distance: {
		unit: null,
		value: null,
		isAbout: null
	},
	surface: {
		code: null,
		desc: null,
		condition: null
	},
	raceType: {
		code: null,
		desc: null,
		classRaceName: null
	},
	raceGrade: {
		code: null,
		desc: null
	},
	purse: {
		unit: null,
		total: null
	},
	ageSexRestr: {
		code: null,
		desc: null,
		shortDesc: null 
	},
	isStatebred: null,
	fractions: {
		pofDist: null,
		pofTime: null,
		splitStart: null,
		splitTime: null
	},
	winTime: function () {
		return (this.fractions) ? this.fractions[(this.fractions.length - 1)].pofTime : null;
	},
	getRaceRunDateCYMD: function () {
		return +(this.raceRunDate.year + "" + this.raceRunDate.month + "" + this.raceRunDate.day);
	},
	performances: null
};

thorobase.thorodata.Performance = {
	pp: null,
	isEntryCoupled: null,
	horseName: null,
	countryCode: null,
	yearOfBirth: null,
	weight: null,
	claimingPrice: null,
	callPositions: {
		pocDist: null,
		pocPos: null,
		pocLengths: null
	},
	didNotFinish: null,
	odds: null,
	medication: {
		code: null,
		desc: null
	},
	blinkered: null,
	trainerName: null,
	jockeyName: null,
	ownerName: null,
	lastRace: {
		raceRunDate: {
			year: null,
			month: null,
			day: null
		},
		raceTrack: null,
		raceNumber: null,
		raceSession: null,
		pp: null
	},
	getLastRaceDateCYMD: function () {
		return +(this.lastRace.raceRunDate.year + "" + this.lastRace.raceRunDate.month + "" + this.lastRace.raceRunDate.day);
	},
	finishBeatenLengths: function () {
		return (this.callPositions) ? this.callPositions[(this.callPositions.length - 1)].pocLengths : null;
	},
	finishPosition: function () {
		return (this.callPositions) ? this.callPositions[(this.callPositions.length - 1)].pocPos : null;
	}
};


// Equibase's static data
thorobase.Equibase = {
	
	// Equibase Points of Call for Various Race Distances (in yards)
	// http://www.equibase.com/newfan/pointsofcall.cfm
	// * = extrapolated distance from Points of Fractions
	pointsOfCall: {
	//   dist:  [start, 1st,  2nd,  3rd, stretch, finish]	// distance equiv
		"220":  [    ,     ,     ,     ,  110,    220],		// 1 furlong		(1 		furlong)*
		"440":  [  55,     ,     ,     ,  247.5,  440],		// 2 furlongs		(2 		furlongs)
		"550":  [  55,     ,     ,     ,  302.5,  550],		// 2 1/2 furlongs	(2.5	furlongs)*
		"660":  [  55,     ,     ,     ,  357.5,  660],		// 3 furlongs		(3 		furlongs)
		"715":  [  55,  440,     ,     ,  577.5,  715],		// 3 1/4 furlongs	(3.25 	furlongs)
		"770":  [  55,  440,     ,     ,  605,    770],		// 3 1/2 furlongs	(3.5	furlongs)*
		"825":  [  55,  440,     ,     ,  632.5,  825],		// 3 3/4 furlongs	(3.75 	furlongs)*
		"880":  [  55,  440,     ,     ,  660,    880],		// 4 furlongs		(4 		furlongs)
		"990":  [  55,  440,     ,     ,  715,    990],		// 4 1/2 furlongs	(4.5 	furlongs)
		"1100": [  55,  550,  660,     ,  880,   1100],		// 5 furlongs		(5 		furlongs)
		"1155": [  55,  550,  660,     ,  907.5, 1155],		// 5 1/4 furlongs	(5.25	furlongs)*
		"1210": [  55,  440,  660,     ,  935,   1210],		// 5 1/2 furlongs	(5.5 	furlongs)
		"1320": [  55,  440,  880,     , 1100,   1320],		// 6 furlongs		(6 		furlongs)
		"1430": [  55,  440,  880,     , 1155,   1430],		// 6 1/2 furlongs	(6.5 	furlongs)
		"1540": [  55,  440,  880,     , 1210,   1540],		// 7 furlongs		(7 		furlongs)
		"1650": [  55,  440,  880,     , 1265,   1650],		// 7 1/2 furlongs	(7.5 	furlongs)
		"1760": [  55,  440,  880, 1320, 1540,   1760],		// 1 mile			(8 		furlongs)
		"1790": [  55,  440,  880, 1320, 1555,   1790],		// 1 mile 30 yards	(8.14 	furlongs)
		"1800": [  55,  440,  880, 1320, 1560,   1800],		// 1 mile 40 yards	(8.18 	furlongs)
		"1830": [  55,  440,  880, 1320, 1575,   1830],		// 1 mile 70 yards	(8.32 	furlongs)
		"1870": [  55,  440,  880, 1320, 1595,   1870],		// 1 1/16 miles 	(8.5 	furlongs)
		"1980": [  55,  440,  880, 1320, 1650,   1980],		// 1 1/8 miles		(9 		furlongs)
		"2090": [  55,  440,  880, 1320, 1705,   2090],		// 1 3/16 miles 	(9.5 	furlongs)
		"2200": [ 440,  880, 1320, 1760, 1980,   2200],		// 1 1/4 miles 		(10 	furlongs)
		"2310": [ 440,  880, 1320, 1760, 2035,   2310],		// 1 5/16 miles 	(10.5 	furlongs)
		"2420": [ 440,  880, 1320, 1760, 2090,   2420],		// 1 3/8 miles 		(11 	furlongs)
		"2530": [ 440,  880, 1760, 2200, 2365,   2530],		// 1 7/16 miles 	(11.5 	furlongs)
		"2640": [ 440,  880, 1760, 2200, 2420,   2640],		// 1 1/2 miles 		(12 	furlongs)
		"2750": [ 440,  880, 1760, 2200, 2475,   2750],		// 1 9/16 miles 	(12.5 	furlongs)
		"2860": [ 440,  880, 1760, 2420, 2640,   2860],		// 1 5/8 miles 		(13 	furlongs)
		"2970": [ 440,  880, 1760, 2420, 2695,   2970],		// 1 11/16 miles 	(13.5 	furlongs)
		"3080": [ 880, 1760, 2200, 2640, 2860,   3080],		// 1 3/4 miles 		(14 	furlongs)
		"3190": [ 880, 1760, 2200, 2640, 2915,   3190],		// 1 13/16 miles	(14.5	furlongs)
		"3300": [ 880, 1760, 2200, 2640, 2970,   3300],		// 1 7/8 miles		(15		furlongs)
		"3410": [ 880, 1760, 2420, 2860, 3135,   3410],		// 1 15/16 miles	(15.5	furlongs)
		"3520": [ 880, 1760, 2640, 3080, 3300,   3520],		// 2 miles			(16		furlongs)
		"3560": [ 880, 1760, 2640, 3080, 3320,   3560],		// 2 miles 40 yards	(16.18	furlongs)
		"3590": [ 880, 1760, 2640, 3080, 3335,   3590],		// 2 miles 70 yards (16.32	furlongs)
		"3630": [ 880, 1760, 2640, 3080, 3355,   3630], 	// 2 1/16 miles		(16.5	furlongs)
		"3740": [ 880, 1760, 2640, 3080, 3410,   3740],		// 2 1/8 miles		(17		furlongs)
		"3850": [ 880, 1760, 2640, 3080, 3465,   3850],		// 2 3/16 miles		(17.5	furlongs)
		"3960": [ 880, 1760, 2640, 3520, 3740,   3960],		// 2 1/4 miles		(18		furlongs)
		"4070": [ 880, 1760, 2640, 3520, 3795,   4070],		// 2 5/16 miles		(18.5	furlongs)
		"5280": [1760, 2640, 3520, 4400, 4840,   5280]		// 3 miles			(24 	furlongs)
	},
	
	// Equibase Points of Fractional Times for Various Race Distances (in yards)
	// http://www.equibase.com/newfan/fractional_times.cfm
	// * = extrapolated distance from Points of Call
	pointsOfFractionals: {
	//   dist:  [frac1, frac2, frac3, frac4, frac5, finish]	// distance equiv
		"220":  [    ,     ,     ,     ,     ,    220],		// 1 furlong		(1 		furlong)
		"440":  [    ,     ,     ,     ,     ,    440],		// 2 furlongs		(2 		furlongs)
		"550":  [ 440,     ,     ,     ,     ,    550],		// 2 1/2 furlongs	(2.5	furlongs)
		"660":  [ 440,     ,     ,     ,     ,    660],		// 3 furlongs		(3 		furlongs)
		"715":  [ 440,     ,     ,     ,     ,    715],		// 3 1/4 furlongs	(3.25 	furlongs)
		"770":  [ 440,  660,     ,     ,     ,    770],		// 3 1/2 furlongs	(3.5	furlongs)
		"825":  [ 440,     ,     ,     ,     ,    825],		// 3 3/4 furlongs	(3.75 	furlongs)
		"880":  [ 440,     ,     ,     ,     ,    880],		// 4 furlongs		(4 		furlongs)
		"990":  [ 440,  880,     ,     ,     ,    990],		// 4 1/2 furlongs	(4.5 	furlongs)
		"1100": [ 440,  880,     ,     ,     ,   1100],		// 5 furlongs		(5 		furlongs)
		"1155": [ 440,  880,     ,     ,     ,   1155],		// 5 1/4 furlongs	(5.25	furlongs)
		"1210": [ 440,  880, 1100,     ,     ,   1210],		// 5 1/2 furlongs	(5.5 	furlongs)
		"1320": [ 440,  880, 1100,     ,     ,   1320],		// 6 furlongs		(6 		furlongs)
		"1430": [ 440,  880, 1320,     ,     ,   1430],		// 6 1/2 furlongs	(6.5 	furlongs)
		"1540": [ 440,  880, 1320,     ,     ,   1540],		// 7 furlongs		(7 		furlongs)
		"1650": [ 440,  880, 1320,     ,     ,   1650],		// 7 1/2 furlongs	(7.5 	furlongs)
		"1760": [ 440,  880, 1320, 1540,     ,   1760],		// 1 mile			(8 		furlongs)
		"1790": [ 440,  880, 1320, 1540,     ,   1790],		// 1 mile 30 yards	(8.14 	furlongs)*
		"1800": [ 440,  880, 1320, 1760,     ,   1800],		// 1 mile 40 yards	(8.18 	furlongs)
		"1830": [ 440,  880, 1320, 1760,     ,   1830],		// 1 mile 70 yards	(8.32 	furlongs)
		"1870": [ 440,  880, 1320, 1760,     ,   1870],		// 1 1/16 miles 	(8.5 	furlongs)
		"1980": [ 440,  880, 1320, 1760,     ,   1980],		// 1 1/8 miles		(9 		furlongs)
		"2090": [ 440,  880, 1320, 1760,     ,   2090],		// 1 3/16 miles 	(9.5 	furlongs)
		"2200": [ 440,  880, 1320, 1760,     ,   2200],		// 1 1/4 miles 		(10 	furlongs)
		"2310": [ 440,  880, 1320, 1760,     ,   2310],		// 1 5/16 miles 	(10.5 	furlongs)
		"2420": [ 440,  880, 1320, 1760, 2200,   2420],		// 1 3/8 miles 		(11 	furlongs)
		"2530": [ 440,  880, 1320, 1760, 2200,   2530],		// 1 7/16 miles 	(11.5 	furlongs)
		"2640": [ 440,  880, 1320, 1760, 2200,   2640],		// 1 1/2 miles 		(12 	furlongs)
		"2750": [ 440,  880, 1320, 1760, 2200,   2750],		// 1 9/16 miles 	(12.5 	furlongs)
		"2860": [ 880, 1320, 1760, 2200, 2640,   2860],		// 1 5/8 miles 		(13 	furlongs)
		"2970": [ 880, 1320, 1760, 2200, 2640,   2970],		// 1 11/16 miles 	(13.5 	furlongs)
		"3080": [ 880, 1320, 1760, 2200, 2640,   3080],		// 1 3/4 miles 		(14 	furlongs)
		"3190": [ 880, 1760, 2200, 2640, 3080,   3190],		// 1 13/16 miles	(14.5	furlongs)
		"3300": [ 880, 1760, 2200, 2640, 3080,   3300],		// 1 7/8 miles		(15		furlongs)
		"3410": [ 880, 1760, 2200, 2640, 3080,   3410],		// 1 15/16 miles	(15.5	furlongs)
		"3520": [ 880, 1760, 2200, 2640, 3080,   3520],		// 2 miles			(16		furlongs)
		"3560": [ 880, 1760, 2640, 3080, 3520,   3560],		// 2 miles 40 yards	(16.18	furlongs)
		"3590": [ 880, 1760, 2640, 3080, 3520,   3590],		// 2 miles 70 yards (16.32	furlongs)
		"3630": [ 880, 1760, 2640, 3080, 3520,   3630], 	// 2 1/16 miles		(16.5	furlongs)
		"3740": [ 880, 1760, 2640, 3080, 3520,   3740],		// 2 1/8 miles		(17		furlongs)
		"3850": [ 880, 1760, 2640, 3080, 3520,   3850],		// 2 3/16 miles		(17.5	furlongs)
		"3960": [ 880, 1760, 2640, 3080, 3520,   3960],		// 2 1/4 miles		(18		furlongs)*
		"4070": [ 880, 1760, 2640, 3080, 3520,   4070],		// 2 5/16 miles		(18.5	furlongs)*
		"5280": [ 880, 1760, 2640, 3080, 3520,   5280]		// 3 miles			(24 	furlongs)*
	}
	
};