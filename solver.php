<?php

set_time_limit(300);

/*
$_POST['grid'] = array(
	array("G", "F", "A", "A", "D"),
	array("L", "S", "F", "B", "L"),
	array("O", "V", "I", "S", "T"),
	array("P", "S", "N", "T", "E"),
	array("G", "N", "I", "D", "R")
);
$_POST['grid'] = '[["G","F","A"],["L","S","F"],["O","P","E"]]';
*/


class Solver {
	
	public $wordsDir;
	public $alphabet;
	public $grid;
	public $files;
	public $maxLength;
	public $possibleWords;
	public $wordsArray;
	public $solutions;
	
	function __construct() {
		$this->files = array();
		$this->possibleWords = array();
		$this->wordsArray = array();
		$this->solutions = array();
		$this->maxLength = 8;
		$this->wordsDir = "wordbank";
		$this->alphabet = array("a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p", "q","r","s","t","u","v","w","x","y","z");
		$this->validateGrid($_POST['grid']);
		$this->getPossibleWordLists();
		$this->getGridCombos();
		$this->sortSolutions();
		
		echo JSON_ENCODE($this->solutions);
		
		//$this->createWordbankDirectories();
		//$this->deleteDirectory($this->wordsDir);
		//$this->buildWordbank();
		//$this->validateGrid($_POST["grid"]);
		//$this->findStartingPaths();
	}
	
	# ===========================================
	# System Initialization processes
	# ===========================================
	function init() {
		$this->createWordbankDirectories();
		$this->buildWordbank();
	}
	
	function deleteDirectory($dir) {
		$handle = opendir($dir);
		while (false !== ($entry = readdir($handle))) {
			if ($entry == "." || $entry == "..") { continue; }
			if (is_dir($dir."/".$entry)) {
				$this->deleteDirectory($dir."/".$entry);
			} else {
				unlink($dir."/".$entry);
			}
		}
		if (!rmdir($dir)) { echo "Could not delete the folder " . $dir; }
	}
	
	function createWordbankDirectories() {
		$dir = $this->wordsDir;
		$alphabet = $this->alphabet;
		
		if (!is_dir($dir)) { mkdir($dir, 0774); }
		
		foreach ($alphabet AS $letter) {
			$sub1 = $dir."/".$letter;
			if (!is_dir($sub1)) { mkdir($dir . "/" . $letter, 0774); }
		}
	}
	
	function buildWordbank() {
		$file = "sowpods.txt";
		$data = file_get_contents($file);
		
		$prerp = array();
		$words = explode("\n", $data);
		foreach($words AS $word) {
			if (preg_match('/[^a-z]/', $word)) { continue; }
			
			$letter1 = substr($word, 0, 1);
			$letter2 = substr($word, 1, 1);
			$concat = $letter1 . $letter2;
			
			if (!isset($prep[$letter1])) { $prep[$letter1] = array(); }
			if (!isset($prep[$letter1][$letter2])) { $prep[$letter1][$letter2] = array(); }
			
			$prep[$letter1][$letter2][] = $word;
		}
		
		foreach($prep AS $letter1 => $letters) {
			foreach ($letters AS $letter2 => $words) {
				$newFile = $letter1.$letter2.".json";
				$words = json_encode($words);
				$handle = fopen($this->wordsDir."/".$letter1."/".$newFile, "w");
				fwrite($handle, $words);
			}
		}
		
	}
	# ===========================================
	# End initialization
	# ===========================================
	
	function getPossibleWordLists() {
		$grid = $this->grid;
		
		$files = array();
		foreach($grid AS $row => $elements) {
			foreach ($elements AS $col => $letter) {
				if (isset($grid[$row][$col-1])) {
					$file = $letter . $grid[$row][$col-1] . ".json";
					$files = $this->addIfExists($files, $this->wordsDir . "/" . $letter . "/" . $file);
				}
				if (isset($grid[$row][$col+1])) {
					$file = $letter . $grid[$row][$col+1] . ".json";
					$files = $this->addIfExists($files, $this->wordsDir . "/" . $letter . "/" . $file);
				}
				if (isset($grid[$row-1][$col])) {
					$file = $letter . $grid[$row-1][$col] . ".json";
					$files = $this->addIfExists($files, $this->wordsDir . "/" . $letter . "/" . $file);
				}
				if (isset($grid[$row-1][$col-1])) {
					$file = $letter . $grid[$row-1][$col-1] . ".json";
					$files = $this->addIfExists($files, $this->wordsDir . "/" . $letter . "/" . $file);
				}
				if (isset($grid[$row-1][$col+1])) {
					$file = $letter . $grid[$row-1][$col+1] . ".json";
					$files = $this->addIfExists($files, $this->wordsDir . "/" . $letter . "/" . $file);
				}
				if (isset($grid[$row+1][$col])) {
					$file = $letter . $grid[$row+1][$col] . ".json";
					$files = $this->addIfExists($files, $this->wordsDir . "/" . $letter . "/" . $file);
				}
				if (isset($grid[$row+1][$col+1])) {
					$file = $letter . $grid[$row+1][$col+1] . ".json";
					$files = $this->addIfExists($files, $this->wordsDir . "/" . $letter . "/" . $file);
				}
				if (isset($grid[$row+1][$col-1])) {
					$file = $letter . $grid[$row+1][$col-1] . ".json";
					$files = $this->addIfExists($files, $this->wordsDir . "/" . $letter . "/" . $file);
				}	
			}
		}
		
		# Filter out any combinations that have no words
		$wordLists = array();
		foreach($files AS $file) { $wordLists[] = json_decode(file_get_contents($file)); }
		
		$words = array();
		foreach($wordLists AS $list) {
			foreach($list AS $k => $word) {
				$this->possibleWords[] = $word;
				$words = $this->createArrayPath($words, $word);
			}
		}
		
		$this->wordsArray = $words;
		
		return $words;
	}
	
	function isValid($array, $word) {
		$key = substr($word, 0, 1);
		if (!isset($array[$key])) { return false; }
		if (strlen($word) > 1) {
			if (!$this->isValid($array[$key], substr($word, 1))) { return false; }
		}
		
		
		return true;
	}
	
	function createArrayPath($array, $word) {
		$key = substr($word, 0, 1);
		if (!isset($array[$key])) { $array[$key] = array(); }
		if (strlen($word) > 1) {
			$array[$key] = $this->createArrayPath($array[$key], substr($word, 1));
		}
		
		return $array;
	}
	
	function addIfExists($array, $filepath) {
		if (file_exists($filepath)) { $array[] = $filepath;	}
		
		return $array;
	}
	
	function getGridCombos() {
		foreach($this->grid AS $row => $elements) {
			foreach($elements AS $col => $letter) {
				$path = array(
					array($row, $col)
				);
				$this->addStep($path);
			}
		}
	}
	
	
	function addStep($path) {
		$grid = $this->grid;
		$coords = end($path);
		$r = $coords[0];
		$c = $coords[1];
		
		
		$word = $this->convertPathToWord($path);
		if (!$this->isValid($this->wordsArray, $word)) { return; }
		if (in_array($word, $this->possibleWords)
		&& !in_array($word, $this->solutions)) {
			$this->solutions[] = $word;
		}
		
		
		if (isset($grid[$r][$c+1])) {
			if (!$this->isStepInPath($path, array($r, $c+1))) {
				$newPath = $path;
				$newPath[] = array($r, $c+1);
				$this->addStep($newPath);
			}
		}
		if (isset($grid[$r][$c-1])) {
			if (!$this->isStepInPath($path, array($r, $c-1))) {
				$newPath = $path;
				$newPath[] = array($r, $c-1);
				$this->addStep($newPath);
			}
		}
		if (isset($grid[$r+1][$c])) {
			if (!$this->isStepInPath($path, array($r+1, $c))) {
				$newPath = $path;
				$newPath[] = array($r+1, $c);
				$this->addStep($newPath);
			}
		}
		if (isset($grid[$r-1][$c])) {
			if (!$this->isStepInPath($path, array($r-1, $c))) {
				$newPath = $path;
				$newPath[] = array($r-1, $c);
				$this->addStep($newPath);
			}
		}
		if (isset($grid[$r+1][$c+1])) {
			if (!$this->isStepInPath($path, array($r+1, $c+1))) {
				$newPath = $path;
				$newPath[] = array($r+1, $c+1);
				$this->addStep($newPath);
			}
		}
		if (isset($grid[$r+1][$c-1])) {
			if (!$this->isStepInPath($path, array($r+1, $c-1))) {
				$newPath = $path;
				$newPath[] = array($r+1, $c-1);
				$this->addStep($newPath);
			}
		}
		if (isset($grid[$r-1][$c+1])) {
			if (!$this->isStepInPath($path, array($r-1, $c+1))) {
				$newPath = $path;
				$newPath[] = array($r-1, $c+1);
				$this->addStep($newPath);
			}
		}
		if (isset($grid[$r-1][$c-1])) {
			if (!$this->isStepInPath($path, array($r-1, $c-1))) {
				$newPath = $path;
				$newPath[] = array($r-1, $c-1);
				$this->addStep($newPath);
			}
		}
	}
	
	function isStepInPath($path, $step) {
		foreach($path AS $p) {
			if ($p[0] === $step[0] 
			&& $p[1] === $step[1]) {
				return true;
			}
		}
		
		return false;
	}
	
	function convertPathToWord($path) {
		$word = "";
		foreach($path AS $step) { $word .= strtolower($this->grid[$step[0]][$step[1]]); }
		
		return $word;
	}
	
	function sortSolutions() {
		array_multisort(array_map('strlen', $this->solutions), $this->solutions);
	}
	
	
	
	// TODO - validate grid entries and test that the decoded JSON is an array
	function validateGrid($grid) {
		try {
			$grid = strtolower($grid);
			$this->grid = json_decode($grid, true);
		} catch(Exception $e) {}
	}
	
	function dumpArray($array, $spacer = "") {
		foreach($array AS $key => $value) {
			echo $spacer;
			echo $key . "<br />";
			if (is_array($value)) {
				$spacer .= "-";
				$this->dumpArray($value, $spacer);
			} else {
				echo $spacer . $value . "<br />";
			}
		}
	}
	
}

$a = new Solver();
?>