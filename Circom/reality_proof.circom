pragma circom 2.0.0;

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/comparators.circom";

template RealityCapsuleProof() {
    signal input ts;      // Timestamp (private)
    signal input freq;    // Harmonic (private)
    signal input pubTokenId; // Public tokenId

    signal output out;

    component poseidon = Poseidon(2);
    poseidon.inputs[0] <== ts;
    poseidon.inputs[1] <== freq;
    out <== poseidon.out;

    pubTokenId === out; // Prove hash(tokenId)

    component isValidFreq = LessThan(252); // freq <= 741
    isValidFreq.in[0] <== freq;
    isValidFreq.in[1] <== 741;
    isValidFreq.out === 1;
}

component main { public [pubTokenId]; return RealityCapsuleProof(); }
