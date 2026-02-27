Custom Entity API

> Introduction
>
> Prerequisite
>
> Base URI
>
> GET: Retrieve all Custom entity instances Description:
>
> Request:
>
> GET request by Id and properties
>
> POST: Create a new Custom entity
>
> PUT: Update a Custom entity
>
> DELETE: Delete a Custom entity by ID Request:
>
> DELETE: Delete multiple Custom entities
>
> Error responses
>
> Notes

Introduction

The Custom Entity API provides endpoints to retrieve and manipulate
Custom entities within your Exact Online

environment. This document describes the main endpoints, their usage,
and provides example requests and responses.

Prerequisite

> The Extension containing the Custom Entity must be installed in your
> environment.
>
> The feature set PremiumExtensionsCustomEntityApi must be enabled.

Base URI

/api/v1/{division}/CustomEntity/BusinessComponent/{entityname}

parameters

> entityname: The name of the Custom Entity (string).
>
> division: The division id (integer).

GET: Retrieve all Custom entity instances

Description:

Retrieves all instances for the specified Custom entity. You can use
query parameters to filter or sort the results.

Request:

api/v1/{division}/CustomEntity/BusinessComponent/{entityname}

> Retrieves all the instances of the Custom entity by entity name.

Response:

> Status: 200 OK
>
> Body: JSON array containing all instances of the specified Custom
> entity and their properties.

Sample response:

/api/v1/129282/CustomEntity/BusinessComponent/SDK_CarPark_Car

> 1 {
>
> 2 "Value": \[ 3 {
>
> 4 "Account": "e501b6bc-8a6a-40ff-b479-9a0cf1112e86", 5 "Account_Code":
> "1 ",
>
> 6 "Created": "2024-02-22T17:11:30.19",
>
> 7 "Creator": "0d0ac153-92a8-4120-a51b-e43e2a22cb83", 8
> "CreatorFullName": "Sol Aurora",
>
> 9 "Description": "Aurora - Kamiq", 10 "Division": 129282,
>
> 11 "ID": "454391fe-c0dc-4960-9534-f5e91517071e", 12 "License":
> "NL561D",
>
> 13 "Model": "3b6f944a-616b-4363-987e-6341d89f610b", 14 "Model_Code":
> "SKD Kamiq",
>
> 15 "Modified": "2024-02-28T02:10:45.94", 16 "Modifier": null,
>
> 17 "ModifierFullName": null, 18 "PictureBlobId": null,
>
> 19 "PictureFilename": null, 20 "PreviousCar": null,
>
> 21 "PreviousCar_License": null,
>
> 22 "PurchaseDate": "2024-02-01T00:00:00", 23
> "RegistrationPictureBlobId": null,
>
> 24 "RegistrationPictureFilename": null, 25 "Remarks": null,
>
> 26 "SecondHand": null,
>
> 27 "Showroom": "b8b075a0-9258-45c1-b772-0bddfd70a6ef", 28
> "Showroom_Name": "Van Mossel"
>
> 29 } 30 \]
>
> 31 }

GET request by Id and properties

api/v1/{division}/CustomEntity/BusinessComponent/{entityname}/{id}?properties=\<list
of properties separated

by comma\>

> Retrieves the Custom entity instance by id with selected properties

Response

You will receive a '200 OK' response. The response includes the
specified properties and their corresponding values for the Custom
entity instance

Example usage and its response

api/v1/129282/CustomEntity/BusinessComponent/SDK_CarPark_Car/454391fe-c0dc-4960-9534-f5e91517071e?
properties=ID,License,Description,Account,PurchaseDate,Model,Showroom

> 1 {
>
> 2 "ID": "454391fe-c0dc-4960-9534-f5e91517071e", 3 "License": "NL561D",
>
> 4 "Description": "Aurora - Kamiq",
>
> 5 "Account": "e501b6bc-8a6a-40ff-b479-9a0cf1112e86", 6 "PurchaseDate":
> "2024-02-01T00:00:00",
>
> 7 "Model": "3b6f944a-616b-4363-987e-6341d89f610b",
>
> 8 "Showroom": "b8b075a0-9258-45c1-b772-0bddfd70a6ef" 9 }

You can also perform filter and select required properties

api/v1/129282/CustomEntity/BusinessComponent/SDK_CarPark_Car?\$select=License

POST: Create a new Custom entity

Description:

Creates a new Custom entity instance.

Request:

api/v1/{division}/CustomEntity/BusinessComponent/{entityname}

This endpoint allows to create the new Custom entity instance

POST Sample body:

> 1 {
>
> 2 "Properties": {
>
> 3 "PropertyName": { 4 "Value": "Test1",
>
> 5 "ValueType": "String" 6 }
>
> 7 } 8 }

Example usage

api/v1/129282/CustomEntity/BusinessComponent/SDK_CarPark_Car

Sample POST data (body)

> 1 {
>
> 2 "Properties": {
>
> 3 "Description": {
>
> 4 "Value": "Audi A4 Crescent", 5 "ValueType": "string"
>
> 6 },
>
> 7 "License": {
>
> 8 "Value": "NL943X",
>
> 9 "ValueType": "string" 10 },
>
> 11 "Model": {
>
> 12 "Value": "8B68AF7C-0255-47CA-ABBD-7E4644B00C30", 13 "ValueType":
> "guid"
>
> 14 } 15 }
>
> 16 }

Sample response:

You will receive the '200 Okʼ response. The response contains the
properties and Key value

> 1 {
>
> 2 "Description": {
>
> 3 "Value": "Audi A4 Crescent", 4 "ValueType": "string"
>
> 5 },
>
> 6 "License": {
>
> 7 "Value": "NL943X",
>
> 8 "ValueType": "string" 9 },
>
> 10 "Model": {
>
> 11 "Value": "{8b68af7c-0255-47ca-abbd-7e4644b00c30}", 12 "ValueType":
> "guid"
>
> 13 },
>
> 14 "ID": {
>
> 15 "Value": "{39ec8e98-6cd6-4292-aa8f-d97897018245}", 16 "ValueType":
> "string"
>
> 17 } 18 }

PUT: Update a Custom entity

Description:

Updates an existing Custom entity instance by its ID.

Request:

api/v1/{division}/CustomEntity/BusinessComponent/{entityname}/{id}

This endpoint allows to update the Custom entity Instance by entity id

Response:

You will receive the '200 Okʼ response. The response contains the
updated properties

Example usage:

api/v1/129282/CustomEntity/BusinessComponent/SDK_CarPark_Car/5cd9676d-e3de-4f9f-80f9-3401695637ce

Sample body:

> 1 {
>
> 2 "Properties": {
>
> 3 "Description": {
>
> 4 "Value": "Audi Car", 5 "ValueType": "String" 6 }
>
> 7 } 8 }

Sample response:

> 1 {
>
> 2 "Description": {
>
> 3 "Value": "Audi Car", 4 "ValueType": "String" 5 }
>
> 6 }

DELETE: Delete a Custom entity by ID

Description:

Deletes a Custom entity entry by its unique identifier i.e. Id

Request:

api/v1/{division}/CustomEntity/BusinessComponent/{entityname}/{id}

Sample Response:

> 200 OK (on successful deletion)

Example usage

api/v1/129282/CustomEntity/BusinessComponent/SDK_CarPark_Car/5cd9676d-e3de-4f9f-80f9-3401695637ce

DELETE: Delete multiple Custom entities

Description:

Deletes multiple Custom entity instances by specifying their IDs in the
request body.

Request:

api/v1/{division}/CustomEntity/BusinessComponent/{entityname}

Example usage

api/v1/129282/CustomEntity/SDK_EMP_Applicant

Sample body:

> Array of ids
>
> \["F975EAFC-6026-45F0-AC4B-593FC4A1AC24","E667D2DA-6D80-4A02-911C-
>
> 9E4E9D1C4167"\]

Sample Response:

> 200 OK (on successful deletion)

Error responses

> 403 Forbidden: When the required feature set or function point is not
> available.
>
> 404 Not Found: When the entity is not a valid Custom Entity or is
> unavailable.

Notes

> All endpoints require authentication and appropriate permissions.
>
> Use the correct division and entity names as configured in your
> environment.
