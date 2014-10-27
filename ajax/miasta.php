<?php

header("Content-type: text/json; charset=UTF-8");
header('Access-Control-Allow-Origin: http://localhost');

$homepage = file_get_contents('http://213.92.139.215/ajax/miasta.php');
echo $homepage;


?>

