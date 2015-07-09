<?php 

$succes = false;

if (!empty($_POST['feedback'])) {
	$data = trim($_POST['feedback']);
	$data = stripslashes($data);
	$data = htmlspecialchars($data);

	$type = trim($_POST['type']);
	$type = stripslashes($type);
	$type = htmlspecialchars($type);


	
	$file = fopen("feedback/feedback.csv","a");

	$succes = fputcsv($file, array($type, $data));

	fclose($file);

} 

if ($succes != false) {
	echo true;
} else {
	echo false;
}