# RestAPI.py – Тапсырыстарды өңдеу және жүргізушілерді бақылау сервисі

from flask import Blueprint, jsonify, make_response, request
from flask_cors import CORS
from extensions import mysql
import datetime, json

rest_api = Blueprint('rest_api', __name__)
CORS(rest_api)

# Бастапқы маршрут (API күйін тексеру)
@rest_api.route("/")
def apiDefault():
    return make_response(jsonify([{
        "Name": "LogiPro REST API",
        "Version": "1.0",
        "Created": "2025-05-01"
    }]))

# -------------------------------
# Тапсырыстарды басқару (Jobs)
# -------------------------------

@rest_api.route('/jobs', methods=['GET', 'POST'])
def jobs():
    if request.method == 'GET':
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM Jobs")
        row_headers = [x[0] for x in cur.description]
        results = cur.fetchall()
        json_data = [dict(zip(row_headers, row)) for row in results]
        return make_response(json.dumps(json_data, default=str))
    
    elif request.method == 'POST':
        _json = request.args
        cur = mysql.connection.cursor()
        cur.execute("""
            INSERT INTO Jobs (CustomerID, ParcelType, ParcelSize, ParcelWeight, PickupID, DropOffID, Comments, DateCreated)
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
        """, (_json['CustomerID'], _json['ParcelType'], _json['ParcelSize'], _json['ParcelWeight'],
              _json['PickupID'], _json['DropOffID'], _json['Comments']))
        mysql.connection.commit()

        # Автоматты TrackingID генерациясы
        job_id = cur.lastrowid
        date = datetime.date.today()
        tracking_id = f"AQ{date.strftime('%m%y')}{job_id}"
        cur.execute("UPDATE Jobs SET TrackingID = %s WHERE JobID = %s", (tracking_id, job_id))
        mysql.connection.commit()
        return make_response(jsonify({"Status": "Success", "TrackingID": tracking_id}))

# -------------------------------
# Жүргізушінің орналасқан жері
# -------------------------------

@rest_api.route('/jobs/<string:tracking_id>/location', methods=['GET'])
def get_location_by_tracking_id(tracking_id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT DriverID FROM Jobs WHERE TrackingID = %s", (tracking_id,))
    result = cur.fetchone()
    if not result:
        return make_response(jsonify({"Error": "Tracking ID not found"}), 404)
    driver_id = result[0]

    cur.execute("SELECT DriverID, FirstName, Location FROM Drivers WHERE DriverID = %s", (driver_id,))
    row_headers = [x[0] for x in cur.description]
    results = cur.fetchall()
    json_data = [dict(zip(row_headers, row)) for row in results]
    return make_response(json.dumps(json_data, default=str))

# -------------------------------
# Жүргізушілер тізімі
# -------------------------------

@rest_api.route('/drivers', methods=['GET'])
def drivers():
    cur = mysql.connection.cursor()
    cur.execute("SELECT DriverID, FirstName, LastName, VehicleID, Location FROM Drivers")
    row_headers = [x[0] for x in cur.description]
    results = cur.fetchall()
    json_data = [dict(zip(row_headers, row)) for row in results]
    return make_response(json.dumps(json_data, default=str))