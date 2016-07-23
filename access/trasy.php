<?php
header("Content-type: text/json; charset=UTF-8");
header('Access-Control-Allow-Origin: http://localhost');

$connStr = 
        'odbc:Driver={Microsoft Access Driver (*.mdb, *.accdb)};' .
        'Dbq=d:\\impet\\Impet dane.accdb;';

$dbh = new PDO($connStr);
$dbh->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
if (isset($_REQUEST['id']))	{
	$id= $_REQUEST['id'];
	echo($id);
};
$params = array( $id );

$sql =  "SELECT * FROM tbltrasy " .
        " WHERE kiedy > #".$id."# ORDER BY kiedy DESC;";
$sth = $dbh->prepare($sql);
$sth->execute();
$res=array();
while ($row = $sth->fetch()) {
    $res[]=$row;
}

echo json_encode($res);
