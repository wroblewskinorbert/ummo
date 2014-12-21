<?php
header("Content-type: text/json; charset=UTF-8");

$connStr = 
        'odbc:Driver={Microsoft Access Driver (*.mdb, *.accdb)};' .
        'Dbq=d:\\impet\\Impet dane.accdb;';

$dbh = new PDO($connStr);
$dbh->setAttribute(PDO::NULL_NATURAL, PDO::ATTR_DEFAULT_FETCH_MODE);
if (isset($_REQUEST['id']))	{
	$id= $_REQUEST['id'];
};
$params = array( $id );

$sql =  "SELECT * FROM tblZdarzenia " .
        "WHERE zdRodzicNabyty= ".$id.";";
$sth = $dbh->prepare($sql);
$sth->execute();
$res=array();
while ($row = $sth->fetch()) {
    $res[]=$row;
}

echo json_encode($res);
