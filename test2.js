
const data = 
{
  "Id": "8e6251a4-49f6-4552-8b1c-73302519d6aa",
  "Name": "dummy name",
  "ProjectCode": "IWB",
  "Trade1Score": 9.5,
  "Trade2Score": 8.2,
  "ObservationScore": 7.8,
  "LastMonthPqaScore": 8.9,
  "FindingScore": 9.2,
  "TotalScore": 8.7,
  "Status": 1,
  "Remark": "Some remark",
  "PdfUrl": null,
  "IsDeleted": false,
  "CreatedBy": "nguyen_huuvan@wohhup.com.vn",
  "CreatedDate": "2023-06-23T08:39:34.494858Z",
  "UpdatedBy": "nguyen_huuvan@wohhup.com.vn",
  "UpdatedDate": "2023-06-29T06:35:59.132485Z",
  "SubAppPqaCheckList1": {
    "Id": "9b3b0a8d-ee3c-4a0a-af49-615f12332e6a",
    "PqaId": "8e6251a4-49f6-4552-8b1c-73302519d6aa",
    "Name": "dummy name",
    "Trade": "Trade B",
    "Location": "Location A",
    "ScoreList": [
      10,
      20,
      30
    ],
    "NoteList": [
      "Note 1",
      "Note 2"
    ],
    "IsDeleted": false,
    "CreatedBy": "nguyen_huuvan@wohhup.com.vn",
    "CreatedDate": "2023-06-23T08:39:34.861251Z",
    "UpdatedBy": "nguyen_huuvan@wohhup.com.vn",
    "UpdatedDate": "2023-06-23T08:55:32.520658Z"
  },
  "SubAppPqaCheckList2": {
    "Id": "e4e0c2bf-d359-45e8-bb6a-d3f2b9035366",
    "PqaId": "8e6251a4-49f6-4552-8b1c-73302519d6aa",
    "Name": "dummy name",
    "Trade": "Trade B",
    "Location": "Location C",
    "ScoreList": [
      10,
      20,
      30
    ],
    "NoteList": [
      "Note 1",
      "Note 2"
    ],
    "IsDeleted": false,
    "CreatedBy": "nguyen_huuvan@wohhup.com.vn",
    "CreatedDate": "2023-06-23T08:39:35.181951Z",
    "UpdatedBy": "nguyen_huuvan@wohhup.com.vn",
    "UpdatedDate": "2023-06-23T08:55:32.52076Z"
  },
  "SubAppPqaObservation": {
    "Id": "4639a5d1-5167-4345-a870-3e01ad29c9e9",
    "Name": "dummy name",
    "PqaId": "8e6251a4-49f6-4552-8b1c-73302519d6aa",
    "Observation": [
      "Observation 1111111",
      "Observation 222222222"
    ],
    "ScoreList": [
      10.0,
      20.0,
      30.0
    ],
    "RemarkList": [
      "Remark 1",
      "Remark 2"
    ],
    "IsDeleted": false,
    "CreatedBy": "nguyen_huuvan@wohhup.com.vn",
    "CreatedDate": "2023-06-23T08:39:35.493271Z",
    "UpdatedBy": "nguyen_huuvan@wohhup.com.vn",
    "UpdatedDate": "2023-06-23T08:55:32.520848Z"
  },
  "SubAppPqaLastMonthFinding": {
    "Id": "dbe5ac43-34d3-4b97-8379-007667d88ed9",
    "PqaId": "8e6251a4-49f6-4552-8b1c-73302519d6aa",
    "Name": "dummy name",
    "ScoreList": {
      "yes": 6,
      "partial": 3,
      "no": 1,
      "na": 1,
      "total_findings": 11
    },
    "IsDeleted": false,
    "CreatedBy": "nguyen_huuvan@wohhup.com.vn",
    "CreatedDate": "2023-06-23T08:39:35.813842Z",
    "UpdatedBy": "nguyen_huuvan@wohhup.com.vn",
    "UpdatedDate": "2023-06-23T08:55:32.520931Z"
  },
  "SubAppPqaFinding": [
    {
      "Id": "bf8bf24e-2460-4e01-8159-75b3a216456e",
      "PqaId": "8e6251a4-49f6-4552-8b1c-73302519d6aa",
      "Name": "dummy name",
      "SeverityPoint": 10,
      "FrequencyPoint": 5,
      "Points": 15,
      "FindingReport": "Finding 1",
      "FindingImage": [
        "subapp/pqa/Screenshot 2023-05-23 080751.png",
        "subapp/pqa/Screenshot 2023-05-23 080751.png"
      ],
      "IsDeleted": false,
      "CreatedBy": "nguyen_huuvan@wohhup.com.vn",
      "CreatedDate": "2023-06-23T08:40:25.182751Z",
      "UpdatedBy": "nguyen_huuvan@wohhup.com.vn",
      "UpdatedDate": "2023-06-23T08:55:32.521005Z"
    },
    {
      "Id": "488c79c9-fa90-4dd3-9f7f-ca9ee1323f5a",
      "PqaId": "8e6251a4-49f6-4552-8b1c-73302519d6aa",
      "Name": "dummy name",
      "SeverityPoint": 10,
      "FrequencyPoint": 20,
      "Points": 30,
      "FindingReport": "2222 Finding 2",
      "FindingImage": [
        "subapp/pqa/Screenshot 2023-05-23 080751.png",
        "subapp/pqa/Screenshot 2023-05-23 080751.png"
      ],
      "IsDeleted": false,
      "CreatedBy": "nguyen_huuvan@wohhup.com.vn",
      "CreatedDate": "2023-06-23T08:40:42.387809Z",
      "UpdatedBy": "nguyen_huuvan@wohhup.com.vn",
      "UpdatedDate": "2023-06-23T08:55:32.932997Z"
    }
  ]
}

module.exports = data;