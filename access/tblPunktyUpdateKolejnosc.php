<?php
header("Content-type: text/json; charset=UTF-8");

$connStr = 
        'odbc:Driver={Microsoft Access Driver (*.mdb, *.accdb)};' .
        'Dbq=d:\\impet\\Impet dane.accdb;';

$db = new PDO($connStr);
$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
if (isset($_REQUEST['id']))	{
	$id= $_REQUEST['id'];
	$kolejnosc= $_REQUEST['kolejnosc'];
};

$sql =  "UPDATE tblZdarzenia " .
        " SET zdKolejnosc =".$kolejnosc.
	    " WHERE zdId = ".$id;

$db->query($sql);

//echo json_encode($res);
