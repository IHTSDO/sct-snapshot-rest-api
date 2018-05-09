/**
 * Created by ar on 7/3/17.
 */

var getV1Relationships=function(v2Relationships, defaultTermType) {
    var v1Relationships=[];
    v2Relationships.forEach(function(v2Relationship) {
        var v1rel=getV1Relationship(v2Relationship, defaultTermType);

        v1Relationships.push(v1rel);

    });
    return v1Relationships;
};
var getV1Relationship=function(v2Relationship, defaultTermType) {
    var v1rel = {
        "relationshipId": v2Relationship.relationshipId,
        "type": {
            "conceptId": v2Relationship.type.conceptId,
            "defaultTerm": v2Relationship.type.preferredTerm
        },
        "target": {
            "conceptId": v2Relationship.destination.conceptId,
            "defaultTerm": v2Relationship.destination.preferredTerm,
            "definitionStatus": "Primitive",
            "statedDescendants": v2Relationship.destination.statedDescendants,
            "inferredDescendants": v2Relationship.destination.inferredDescendants,
            "active": v2Relationship.destination.active,
            "effectiveTime": v2Relationship.destination.effectiveTime,
            "module": v2Relationship.destination.module.conceptId
        },
        "targetInferredAncestors":v2Relationship.targetInferredAncestors,
        "targetStatedAncestors":v2Relationship.targetStatedAncestors,
        "typeInferredAncestors":v2Relationship.typeInferredAncestors,
        "typeStatedAncestors":v2Relationship.typeStatedAncestors,
        "sourceId": v2Relationship.sourceId,
        "groupId": v2Relationship.relationshipGroup,
        "charType": {
            "conceptId": v2Relationship.characteristicType.conceptId,
            "defaultTerm": v2Relationship.characteristicType.preferredTerm
        },
        "modifier": "Existential restriction",
        "active": v2Relationship.active,
        "effectiveTime": v2Relationship.effectiveTime,
        "module": v2Relationship.module.conceptId
    };
    if (v2Relationship.destination.definitionStatus.conceptId != "900000000000074008") {
        v1rel.target.definitionStatus = "Fully defined";
    }
    if (defaultTermType =="900000000000003001" && v2Relationship.destination.fullySpecifiedName){
        v1rel.target.defaultTerm= v2Relationship.destination.fullySpecifiedName;
    }

    return v1rel;
};

var getV1ConceptDescriptors=function(v2Concepts, defaultTermType) {
    var v1Concepts=[];
    v2Concepts.forEach(function(v2Concept) {
        var v1cpt=getV1ConceptDescriptor(v2Concept, defaultTermType);

        v1Concepts.push(v1cpt);

    });
    return v1Concepts;
};

var getV1ConceptDescriptor=function(v2Concept, defaultTermType) {
    var v1cpt = {
        conceptId: v2Concept.conceptId,
        defaultTerm: v2Concept.preferredTerm,
        definitionStatus: "Primitive",
        module: v2Concept.module.conceptId,
        isLeafInferred:v2Concept.isLeafInferred,
        isLeafStated:v2Concept.isLeafStated,
        effectiveTime:v2Concept.effectiveTime,
        active:v2Concept.active,
        statedDescendants:v2Concept.statedDescendants,
        inferredDescendants:v2Concept.inferredDescendants
    };
    if (v2Concept.definitionStatus.conceptId != "900000000000074008") {
        v1cpt.definitionStatus = "Fully defined";
    }

    if (defaultTermType =="900000000000003001" && v2Concept.fullySpecifiedName){
        v1cpt.defaultTerm=v2Concept.fullySpecifiedName;
    }
    return v1cpt;
};

var getV1Descriptions=function(v2Descriptions) {
    var v1Descriptions=[];
    v2Descriptions.forEach(function(v2Description) {
        var v1desc=getV1Description(v2Description);

        v1Descriptions.push(v1desc);

    });
    return v1Descriptions;
};

var getV1Description=function(v2Description) {
    var v1desc = {
        "descriptionId": v2Description.descriptionId,
        "conceptId": v2Description.conceptId,
        "type": {
            "conceptId": v2Description.type.conceptId,
            "defaultTerm": v2Description.type.preferredTerm
        },
        "lang": v2Description.languageCode,
        "term": v2Description.term,
        "length": v2Description.length,
        "ics": {
            "conceptId": v2Description.caseSignificance.conceptId,
            "defaultTerm": v2Description.caseSignificance.preferredTerm
        },
        "langMemberships": [],
        "words": v2Description.words,
        "active": v2Description.active,
        "effectiveTime": v2Description.effectiveTime,
        "module": v2Description.module.conceptId
    };
    if (v2Description.acceptability) {
        v2Description.acceptability.forEach(function (member) {
            var langMember = {
                "descriptionId": member.descriptionId,
                "refset": {
                    "conceptId": member.languageReferenceSet.conceptId,
                    "defaultTerm": member.languageReferenceSet.preferredTerm
                },
                "acceptability": {
                    "conceptId": member.acceptability.conceptId,
                    "defaultTerm": member.acceptability.preferredTerm
                },
                "uuid": member.uuid,
                "active": member.active,
                "effectiveTime": member.effectiveTime,
                "module": member.module.conceptId
            };
            v1desc.langMemberships.push(langMember);

        });
    }
    return v1desc;
};

var getV1Concepts=function(v2Concepts, defaultTermType) {
    var v1Concepts=[];
    v2Concepts.forEach(function(v2Concept) {
        var v1cpt=getV1Concept(v2Concept, defaultTermType);

        v1Concepts.push(v1cpt);

    });
    return v1Concepts;
};

var getV1Concept=function(v2Concept, defaultTermType) {
    var v1cpt = {
        "memberships": [],
        "descriptions": [],
        "relationships": [],
        "statedRelationships": [],
        "additionalRelationships": [],
        "isLeafInferred": v2Concept.isLeafInferred,
        "isLeafStated": v2Concept.isLeafStated,
        "fsn": v2Concept.fullySpecifiedName,
        "semtag": v2Concept.semtag,
        "inferredAncestors": v2Concept.inferredAncestors,
        "statedAncestors": v2Concept.statedAncestors,
        "conceptId": v2Concept.conceptId,
        "defaultTerm": v2Concept.fullySpecifiedName,
        "definitionStatus": "Primitive",
        "statedDescendants": v2Concept.statedDescendants,
        "inferredDescendants": v2Concept.inferredDescendants,
        "active": v2Concept.active,
        "effectiveTime": v2Concept.effectiveTime,
        "module": v2Concept.module.conceptId
    };

    if (v2Concept.definitionStatus.conceptId != "900000000000074008") {
        v1cpt.definitionStatus = "Fully defined";
    }
    if (defaultTermType == "900000000000013009") {
        v1cpt.defaultTerm = v2Concept.preferredTerm;
    }
    if (v2Concept.memberships) {
        v2Concept.memberships.forEach(function (member) {
            var membership =
                {
                    "type": member.type,
                    "referencedComponentId": member.referencedComponentId,
                    "refset": {
                        "conceptId": member.refset.conceptId,
                        "defaultTerm": member.refset.preferredTerm
                    },
                    "otherValue": member.otherValue,
                    "uuid": member.uuid,
                    "active": member.active,
                    "effectiveTime": member.effectiveTime,
                    "module": member.module.conceptId
                };

            if (member.cidValue) {
                membership.cidValue = {
                    conceptId: member.cidValue.conceptId,
                    defaultTerm: member.cidValue.preferredTerm
                };
            }
            v1cpt.memberships.push(membership);
        });
    }
    if (v2Concept.descriptions) {
        v1cpt.descriptions = getV1Descriptions(v2Concept.descriptions);
    }
    if (v2Concept.relationships) {
        v2Concept.relationships.forEach(function (relationship) {
            if (relationship.characteristicType.conceptId == "900000000000010007") {
                v1cpt.statedRelationships.push(getV1Relationship(relationship, defaultTermType));
            } else if (relationship.characteristicType.conceptId == "900000000000011006") {
                v1cpt.relationships.push(getV1Relationship(relationship, defaultTermType));
            } else if (relationship.characteristicType.conceptId == "900000000000227009") {
                v1cpt.additionalRelationships.push(getV1Relationship(relationship, defaultTermType));
            }

        });
    }
    return v1cpt;
};

var getManifestsV1=function(v2Manifests) {
    var v1Manifests=[];
    v2Manifests.forEach(function(v2Manifest) {
        var v1mfst=getManifestV1(v2Manifest);

        v1Manifests.push(v1mfst);

    });
    return v1Manifests;
};

var getManifestV1=function(v2Manifest) {
    var v1mfst = {
        _id: v2Manifest._id,
        resourceSetName: v2Manifest.resourceSetName,
        databaseName: v2Manifest.databaseName,
        collectionName:v2Manifest.collectionName,
        effectiveTime:v2Manifest.effectiveTime,
        modules:[],
        languageRefsets:[],
        refsets:[],
        languageRefsetsAbbrev:v2Manifest.languageRefsetsAbbrev,
        defaultTermLangCode:v2Manifest.defaultTermLangCode,
        defaultTermType:v2Manifest.defaultTermType,
        defaultTermLangRefset:v2Manifest.defaultTermLangRefset,
        textIndexNormalized:v2Manifest.textIndexNormalized
    };
    if (v2Manifest.modules){
        v2Manifest.modules.forEach(function(modulev2){
            v1mfst.modules.push( getV1ConceptDescriptor(modulev2));
        });
    }

    if (v2Manifest.languageRefsets){
        v2Manifest.languageRefsets.forEach(function(langv2){
            v1mfst.languageRefsets.push( getV1ConceptDescriptor(langv2));
        });
    }

    if (v2Manifest.refsets){
        v2Manifest.refsets.forEach(function(refsetv2){
            var refv1=getV1ConceptDescriptor(refsetv2);
            refv1.count=refsetv2.count;
            refv1.type=refsetv2.type;
            v1mfst.refsets.push( refv1);
        });
    }

    return v1mfst;
};


var getExpressionResultsV1=function(v2ExpResults) {
    var v1ExpResults=[];
    v2ExpResults.forEach(function(v2ExpResult) {
        var v1expres={
            conceptId :v2ExpResult.conceptId,
            defaultTerm:v2ExpResult.fullySpecifiedName
        };

        v1ExpResults.push(v1expres);

    });
    return v1ExpResults;
};


var getV1ConceptDescriptorsAndRels=function(v2Concepts, defaultTermType) {
    var v1Concepts=[];
    v2Concepts.forEach(function(v2Concept) {
        var v1cpt=getV1ConceptDescriptor(v2Concept, defaultTermType);

        v1cpt.relationships=[];
        v1cpt.statedRelationships=[];
        v1cpt.additionalRelationships=[];
        if (v2Concept.relationships) {
            v2Concept.relationships.forEach(function (relationship) {
                if (relationship.characteristicType.conceptId == "900000000000010007") {
                    v1cpt.statedRelationships.push(getV1Relationship(relationship, defaultTermType));
                } else if (relationship.characteristicType.conceptId == "900000000000011006") {
                    v1cpt.relationships.push(getV1Relationship(relationship, defaultTermType));
                } else if (relationship.characteristicType.conceptId == "900000000000227009") {
                    v1cpt.additionalRelationships.push(getV1Relationship(relationship, defaultTermType));
                }

            });
        }
        if (v1cpt.relationships.length==0){
            delete v1cpt.relationships;
        }
        if (v1cpt.statedRelationships.length==0){
            delete v1cpt.statedRelationships;
        }
        if (v1cpt.additionalRelationships.length==0){
            delete v1cpt.additionalRelationships;
        }
        v1Concepts.push(v1cpt);

    });
    return v1Concepts;
};

module.exports.getV1Concepts=getV1Concepts;
module.exports.getV1Concept=getV1Concept;
module.exports.getV1Descriptions=getV1Descriptions;
module.exports.getV1Description=getV1Description;
module.exports.getV1ConceptDescriptors=getV1ConceptDescriptors;
module.exports.getV1ConceptDescriptor=getV1ConceptDescriptor;
module.exports.getV1Relationships=getV1Relationships;
module.exports.getV1Relationship=getV1Relationship;
module.exports.getManifestsV1=getManifestsV1;
module.exports.getManifestV1=getManifestV1;
module.exports.getExpressionResultsV1=getExpressionResultsV1;
module.exports.getV1ConceptDescriptorsAndRels=getV1ConceptDescriptorsAndRels;

