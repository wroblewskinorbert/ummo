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

$mid = $_GET['id'];

if ($mid == -1) {
	$tsql = "SELECT * FROM dbo.tblFirmy";
	$stmt = sqlsrv_query($conn, $tsql, array(), array("Scrollable" => SQLSRV_CURSOR_KEYSET));
	if ($stmt === false) {
		echo "Error in statement execution.\n";
		die(print_r(sqlsrv_errors(), true));
	}
	$num = sqlsrv_num_rows($stmt);
	echo $num;
	die();

} else {

	/* Set up the Transact-SQL query. */
	$tsql = "SELECT top 30 * 
         FROM dbo.tblFirmy 
         WHERE id >  '$mid' and wspN is not null and wspE is not null order by nazwa";
}

/* Execute the query. */
$stmt = sqlsrv_query($conn, $tsql, $params);
if ($stmt === false) {
	echo "Error in statement execution.\n";
	die(print_r(sqlsrv_errors(), true));
}

$firmy = array();
while ($mRow = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
	$firmy[] = $mRow;
}
echo json_encode($firmy);

/* Free the statement and connection resources. */
sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);
?>