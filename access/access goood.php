<?php
header("Content-type: text/json; charset=UTF-8");

$connStr = 
        'odbc:Driver={Microsoft Access Driver (*.mdb, *.accdb)};' .
        'Dbq=d:\\impet\\Impetdane.accdb;';

$dbh = new PDO($connStr);
$dbh->setAttribute(PDO::NULL_NATURAL, PDO::ATTR_DEFAULT_FETCH_MODE);

$sql = 
        "SELECT * FROM tblTowar " .
        "WHERE twr_Id <  25";
$sth = $dbh->prepare($sql);

// query parameter value(s)
$params = array( 25 );

$sth->execute($params);
$res=array();
while ($row = $sth->fetch()) {
    $res[]=$row;
}

echo json_encode($res);
?>