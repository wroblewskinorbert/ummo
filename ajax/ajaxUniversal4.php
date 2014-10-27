<?php
header("Content-type: text/json; charset=UTF-8");
header("Cache-Control: no-transform,public,max-age=3000,s-maxage=9000"); 
//header("Cache-Control: no-cache, must-revalidate"); 
header('Access-Control-Allow-Origin: http://ummo.pl');

if (!isset($_REQUEST['table']) && !isset($_REQUEST['action']) && !isset($_REQUEST['condition']) && !isset($_REQUEST['data'])) {
	$error = array();
	$error['error'] = sqlsrv_errors();
	die(json_encode($error, JSON_HEX_TAG));

} else {

	/* Connect using SQL Server Authentication. */
	$serverName = "PENTIUM24\INSERTGT";
	$uid = "sa";
	$pwd = "";
	$connectionInfo = array("UID" => $uid, "PWD" => $pwd, "Database" => "Impet_armatura", "CharacterSet" => "UTF-8");
	$conn = sqlsrv_connect($serverName, $connectionInfo) or dbError();

	$tab = 'dbo.tbl' . $_REQUEST['table'];
	$act = $_REQUEST['action'];
	$con = $_REQUEST['condition'];
	$dat = json_decode($_REQUEST['data']);
// var_dump($dat);

	if ($act == 'select') {//SELECT
		if ($dat !== 0) {
			$tsql = $dat;
		} else {
			$tsql = "SELECT *  FROM $tab WHERE $con";
		}
		$params = array();
		$stmt = sqlsrv_query($conn, $tsql, $params) or dbError();
		$rekordy = array();
		while ($mRow = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
			$rekordy[] = $mRow;
		}
		echo pS(json_encode($rekordy));

	} elseif ($act == 'insert') {// INSERT
		foreach ($dat as $key => $val) {$co[] = $key;
			$va[] = "'$val'";
		};
		$col = implode(', ', $co);
		$values = implode(', ', $va);
		$params = array();

		$tsql = "INSERT INTO $tab
			($col)
         VALUES ($values); SELECT SCOPE_IDENTITY() AS ID";
		$stmt = sqlsrv_query($conn, $tsql, $params) or dbError();
		sqlsrv_next_result($stmt);
		sqlsrv_fetch($stmt);
		$id = sqlsrv_get_field($stmt, 0);
		$dat -> id = $id;
		echo json_encode($dat);
	} elseif ($act == 'update') {// UPDATE
		foreach ($dat as $key => $val) {
			$setAr[] = "$key = '$val'";
		}
		$set = implode(', ', $setAr);
		$tsql = "UPDATE $tab SET $set WHERE $con;";
		$stmt = sqlsrv_query($conn, $tsql);
		$rows_affected = sqlsrv_rows_affected($stmt) or dbError();
		if ($rows_affected == -1) {
			echo "{\"update\":\"No information available.\"}";
		} else {
			echo "{\"update\": $rows_affected}";
		}

	} elseif ($act == 'delete') {
		$tsql = "DELETE FROM $tab WHERE $con;";
		$stmt = sqlsrv_query($conn, $tsql) or dbError();
		echo "{}";
	}

	sqlsrv_free_stmt($stmt);
	sqlsrv_close($conn);

}
function pS($myString){
	$trans=array("<div>"=>"\\n","</div>"=>"","&nbsp;"=>" ","\'"=>"\\'",'\"'=>'\\"',"\\r"=>"","\\n"=>"");
	return strtr($myString,$trans);
	}

function dbError() {
	$error = array();
	$error['error'] = sqlsrv_errors();
	die(json_encode($error, JSON_HEX_TAG));

}
?>