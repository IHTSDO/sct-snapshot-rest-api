/**
 * Created by alo on 10/31/16.
 */
module.exports.capabilityStatement = {
    resourceType: "CapabilityStatement",
    id: "terminology-server",
    // text: {
    //     status: "generated",
    //     div: "<div xmlns=\"http://www.w3.org/1999/xhtml\"> <h2>Terminology Service Capability Statement</h2> <div> <p>Basic capability statement for a Terminology Server. A server can support more fucntionality than defined here, but this is the minimum amount</p> </div> <table> <tr> <td>Mode</td> <td>SERVER</td> </tr> <tr> <td>Description</td> <td>RESTful Terminology Server</td> </tr> <tr> <td>Transaction</td> <td/> </tr> <tr> <td>System History</td> <td/> </tr> <tr> <td>System Search</td> <td/> </tr> </table> <table> <tr> <th> <b>Resource Type</b> </th> <th> <b>Profile</b> </th> <th> <b>Read</b> </th> <th> <b>V-Read</b> </th> <th> <b>Search</b> </th> <th> <b>Update</b> </th> <th> <b>Updates</b> </th> <th> <b>Create</b> </th> <th> <b>Delete</b> </th> <th> <b>History</b> </th> </tr> <tr> <td>ValueSet</td> <td> <a href="StructureDefinition/ValueSet">StructureDefinition/ValueSet</a> </td> <td>y</td> <td/> <td>y</td> <td/> <td/> <td/> <td/> <td/> </tr> <tr> <td>ConceptMap</td> <td> <a href="StructureDefinition/ConceptMap">StructureDefinition/ConceptMap</a> </td> <td>y</td> <td/> <td>y</td> <td/> <td/> <td/> <td/> <td/> </tr> </table> </div>"
    // },
    extension: [
        {
            url: "http://hl7.org/fhir/StructureDefinition/capabilitystatement-supported-system",
            valueUri: "http://loinc.org"
        }
    ],
    url: "http://hl7.org/fhir/terminology-server",
    name: "Terminology Service Capability Statement",
    status: "draft",
    date: "2015-07-05",
    publisher: "HL7, Inc",
    contact: [
        {
            name: "FHIR Project",
            telecom: [
                {
                    system: "other",
                    value: "http://hl7.org/fhir"
                }
            ]
        }
    ],
    description: "Basic capability statement for a Terminology Server. A server can support more fucntionality than defined here, but this is the minimum amount",
    kind: "capability",
    software: {
        name: "IHTSDO Terminology Server"
    },
    fhirVersion: "1.7.0",
    acceptUnknown: "both",
    format: [
        "json",
        "xml"
    ],
    rest: [
        {
            mode: "server",
            documentation: "RESTful Terminology Server",
            security: {
                cors: true,
                service: [
                    {
                        coding: [
                            {
                                system: "http://hl7.org/fhir/restful-security-service",
                                code: "Certificates"
                            }
                        ]
                    }
                ]
            },
            resource: [
                {
                    type: "ValueSet",
                    profile: {
                        reference: "StructureDefinition/ValueSet"
                    },
                    interaction: [
                        {
                            code: "read",
                            documentation: "Read allows clients to get the logical definitions of the value sets"
                        },
                        {
                            code: "search-type",
                            documentation: "Search allows clients to find value sets on the server"
                        }
                    ],
                    searchParam: [
                        {
                            name: "code",
                            definition: "http://hl7.org/fhir/SearchParameter/ValueSet-code",
                            type: "token"
                        },
                        {
                            name: "date",
                            definition: "http://hl7.org/fhir/SearchParameter/ValueSet-date",
                            type: "date"
                        },
                        {
                            name: "name",
                            definition: "http://hl7.org/fhir/SearchParameter/ValueSet-name",
                            type: "string"
                        },
                        {
                            name: "reference",
                            definition: "http://hl7.org/fhir/SearchParameter/ValueSet-reference",
                            type: "token"
                        },
                        {
                            name: "status",
                            definition: "http://hl7.org/fhir/SearchParameter/ValueSet-status",
                            type: "token"
                        },
                        {
                            name: "system",
                            definition: "http://hl7.org/fhir/SearchParameter/ValueSet-system",
                            type: "uri"
                        },
                        {
                            name: "url",
                            definition: "http://hl7.org/fhir/SearchParameter/ValueSet-url",
                            type: "uri"
                        },
                        {
                            name: "version",
                            definition: "http://hl7.org/fhir/SearchParameter/ValueSet-version",
                            type: "token"
                        }
                    ]
                },
                {
                    type: "ConceptMap",
                    profile: {
                        reference: "StructureDefinition/ConceptMap"
                    },
                    interaction: [
                        {
                            code: "read",
                            documentation: "Read allows clients to get the logical definitions of the concept maps"
                        },
                        {
                            code: "search-type",
                            documentation: "Search allows clients to find concept maps on the server"
                        }
                    ],
                    searchParam: [
                        {
                            name: "date",
                            definition: "http://hl7.org/fhir/SearchParameter/ConceptMap-date",
                            type: "date"
                        },
                        {
                            name: "name",
                            definition: "http://hl7.org/fhir/SearchParameter/ConceptMap-name",
                            type: "string"
                        },
                        {
                            name: "status",
                            definition: "http://hl7.org/fhir/SearchParameter/ConceptMap-status",
                            type: "token"
                        },
                        {
                            name: "source",
                            definition: "http://hl7.org/fhir/SearchParameter/ConceptMap-source",
                            type: "uri"
                        },
                        {
                            name: "target",
                            definition: "http://hl7.org/fhir/SearchParameter/ConceptMap-target",
                            type: "uri"
                        },
                        {
                            name: "url",
                            definition: "http://hl7.org/fhir/SearchParameter/ConceptMap-url",
                            type: "uri"
                        },
                        {
                            name: "version",
                            definition: "http://hl7.org/fhir/SearchParameter/ConceptMap-version",
                            type: "token"
                        }
                    ]
                }
            ],
            operation: [
                {
                    name: "expand",
                    definition: {
                        reference: "OperationDefinition/ValueSet-expand"
                    }
                },
                {
                    name: "lookup",
                    definition: {
                        reference: "OperationDefinition/CodeSystem-lookup"
                    }
                },
                {
                    name: "validate-code",
                    definition: {
                        reference: "OperationDefinition/ValueSet-validate-code"
                    }
                },
                {
                    name: "translate",
                    definition: {
                        reference: "OperationDefinition/ConceptMap-translate"
                    }
                },
                {
                    name: "closure",
                    definition: {
                        reference: "OperationDefinition/ConceptMap-closure"
                    }
                }
            ]
        }
    ]
};