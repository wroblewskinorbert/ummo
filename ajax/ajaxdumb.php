<?php
header("Content-type: text/html; charset=UTF-8");
if (!isset($_GET['table']) && !isset($_GET['action']) && !isset($_GET['condition']) && !isset($_GET['data'])) {
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
/*
	$tab = 'dbo.tbl' . $_GET['table'];
	$act = $_GET['action'];
	$con = $_GET['condition'];
	$dat = json_decode($_GET['data']);
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
		echo $tab."=". pS(json_encode($rekordy));

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
	}*/
	$tab= array('ok'=>100);	
		
		echo 'Data='.json_encode($tab);
	
//	sqlsrv_free_stmt($stmt);
	sqlsrv_close($conn);

}
function pS($myString){
	$trans=array("<div>"=>"\\n","</div>"=>"","&nbsp;"=>" ","\'"=>"\\'",'\"'=>'\\"',"\\r"=>"","\\n"=>"");
	return strtr($myString,$trans);
	}

function dbError(&$stmt) {
	$error = array();
	$error['error'] = sqlsrv_errors();
	die(json_encode($error, JSON_HEX_TAG));

}
?>