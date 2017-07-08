/**
 * Created by ar on 7/3/17.
 */

var getV1Relationships=function(v2Relationships) {
    var v1Relationships=[];
    v2Relationships.forEach(function(v2Relationship) {
        var v1rel=getV1Relationship(v2Relationship);

        v1Relationships.push(v1rel);

    });
    return v1Relationships;
};
var getV1Relationship=function(v2Relationship) {
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

    return v1rel;
};

var getV1ConceptDescriptors=function(v2Concepts) {
    var v1Concepts=[];
    v2Concepts.forEach(function(v2Concept) {
        var v1cpt=getV1ConceptDescriptor(v2Concept);

        v1Concepts.push(v1cpt);

    });
    return v1Concepts;
};

var getV1ConceptDescriptor=function(v2Concept) {
    var v1cpt = {
        conceptId: v2Concept.conceptId,
        defaultTerm: v2Concept.preferredTerm,
        definitionStatus: "Primitive",
        module: v2Concept.module.conceptId,
        isLeafInferred:v2Concept.isLeafInferred,
        isLeafStated:v2Concept.isLeafStated,
        effectiveTime:v2Concept.effectiveTime,
        active:v2Concept.active,
        statedDescendants:v2Concept.statedDescendants
    };
    if (v2Concept.definitionStatus.conceptId != "900000000000074008") {
        v1cpt.definitionStatus = "Fully defined";
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

var getV1Concepts=function(v2Concepts) {
    var v1Concepts=[];
    v2Concepts.forEach(function(v2Concept) {
        var v1cpt=getV1Concept(v2Concept);

        v1Concepts.push(v1cpt);

    });
    return v1Concepts;
};

var getV1Concept=function(v2Concept) {
    var v1cpt = {
        "memberships" : [],
        "descriptions" : [],
        "relationships" : [],
        "statedRelationships" : [],
        "additionalRelationships":[],
        "isLeafInferred" : v2Concept.isLeafInferred,
        "isLeafStated" : v2Concept.isLeafStated,
        "fsn" : v2Concept.fullySpecifiedName,
        "semtag" : v2Concept.semtag,
        "inferredAncestors" : v2Concept.inferredAncestors,
        "statedAncestors" : v2Concept.statedAncestors,
        "conceptId" : v2Concept.conceptId,
        "defaultTerm" : v2Concept.fullySpecifiedName,
        "definitionStatus" : "Primitive",
        "statedDescendants" : v2Concept.statedDescendants,
        "inferredDescendants" : v2Concept.inferredDescendants,
        "active" : v2Concept.active,
        "effectiveTime" : v2Concept.effectiveTime,
        "module" : v2Concept.module.conceptId
    };

    if (v2Concept.definitionStatus.conceptId != "900000000000074008") {
        v1cpt.definitionStatus = "Fully defined";
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
            v1cpt.memberships.push(membership);
        });
        if (v2Concept.descriptions){
            v1cpt.descriptions=getV1Descriptions(v2Concept.descriptions);
        }
        if (v2Concept.relationships){
            v2Concept.relationships.forEach(function(relationship){
                if (relationship.characteristicType.conceptId=="900000000000010007"){
                    v1cpt.statedRelationships.push(getV1Relationship(relationship));
                }else if(relationship.characteristicType.conceptId=="900000000000011006"){
                    v1cpt.relationships.push(getV1Relationship(relationship));
                }else if(relationship.characteristicType.conceptId=="900000000000227009"){
                    v1cpt.additionalRelationships.push(getV1Relationship(relationship));
                }

            });
        }
    }
    return v1cpt;
};

module.exports.getV1Concepts=getV1Concepts;
module.exports.getV1Concept=getV1Concept;
module.exports.getV1Descriptions=getV1Descriptions;
module.exports.getV1Description=getV1Description;
module.exports.getV1ConceptDescriptors=getV1ConceptDescriptors;
module.exports.getV1ConceptDescriptor=getV1ConceptDescriptor;
module.exports.getV1Relationships=getV1Relationships;
module.exports.getV1Relationship=getV1Relationship;

