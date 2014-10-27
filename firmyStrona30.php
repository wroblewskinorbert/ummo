<?php
header("Content-type: text/html; charset=UTF-8");

$serverName = "PENTIUM24\INSERTGT";
$uid = "sa";
$pwd = "";
$connectionInfo = array("UID" => $uid, "PWD" => $pwd, "Database" => "Impet_armatura", "CharacterSet" => "UTF-8");

/* Connect using SQL Server Authentication. */
$conn = sqlsrv_connect($serverName, $connectionInfo);
if ($conn === false) {
	echo "Unable to connect.</br>";
	die(print_r(sqlsrv_errors(), true));
}

$params = array();

if (!isset($_GET['id']))
	die("Nie wybrano firmy!");

$offset= $_GET['id'];


	/* Set up the Transact-SQL query. */
	$tsql = "SELECT  * 
         FROM dbo.tblFirmy 
         order by nazwa";

/* Execute the query. */
$stmt = sqlsrv_query($conn, $tsql, $params, array("Scrollable" => 'static' ));
if ($stmt === false) {
	echo "Error in statement execution.\n";
	die(print_r(sqlsrv_errors(), true));
}

$firmy = array();
for ($x=0;$x<30;$x++)
 {($mRow = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC, SQLSRV_SCROLL_ABSOLUTE, $offset+$x)); 
	$firmy[] = $mRow;
}
echo json_encode($firmy);

/* Free the statement and connection resources. */
sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);
?>