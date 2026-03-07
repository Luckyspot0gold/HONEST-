npm i circomlib snarkjs
circom reality_proof.circom --r1cs --wasm --sym
snarkjs groth16 setup reality_proof.r1cs powersOfTau28_hez_final_10.ptau reality_proof_0000.zkey
snarkjs zkey contribute ... # Skip
snarkjs groth16 export-verifier reality_proof_verifier.sol # Paste to contract
