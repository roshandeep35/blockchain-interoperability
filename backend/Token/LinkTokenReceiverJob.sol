type = "directrequest"
schemaVersion = 1
name = "Cross-Chain Data Receiver Job"
externalJobID = "4d6b7f2e-c75d-4d3f-8ab2-5b1e455d8f2f"
forwardingAllowed = false
maxTaskDuration = "0s"
contractAddress = "0x8650065E8c1E929FB6e79AC0ab7519938AcC3294"
evmChainID = "1338"
minIncomingConfirmations = 0
minContractPaymentLinkJuels = "0"
observationSource = """
    decode_log   [type="ethabidecodelog"
                  abi="OracleRequest(bytes32 indexed specId, address requester, bytes32 requestId, uint256 payment, address callbackAddr, bytes4 callbackFunctionId, uint256 cancelExpiration, uint256 dataVersion, bytes data)"
                  data="$(jobRun.logData)"
                  topics="$(jobRun.logTopics)"]

    decode_cbor  [type="cborparse" data="$(decode_log.data)"]

    fetch        [type="http" method=GET url="$(decode_cbor.get)" headers="[\\"Authorization\\", \\"Bearer gS+xc4XUsv3CA+iURw0b3H8gEit0VDlk\\"]" allowUnrestrictedNetworkAccess="true"]

    parse_chain_id   [type="jsonparse" path="ChainID" data="$(fetch)"]
    parse_receiver   [type="jsonparse" path="Receiver" data="$(fetch)"]
    parse_amount     [type="jsonparse" path="Amount" data="$(fetch)"]

    encode_data  [type="ethabiencode"
                  abi="(bytes32 requestId, uint256 chainId, address receiver, uint256 amount)"
                  data="{ \\"requestId\\": $(decode_log.requestId), \\"chainId\\": $(parse_chain_id), \\"receiver\\": $(parse_receiver), \\"amount\\": $(parse_amount) }"]

    encode_tx    [type="ethabiencode"
                  abi="fulfillOracleRequest2(bytes32 requestId, uint256 payment, address callbackAddress, bytes4 callbackFunctionId, uint256 expiration, bytes calldata data)"
                  data="{\\"requestId\\": $(decode_log.requestId), \\"payment\\": $(decode_log.payment), \\"callbackAddress\\": $(decode_log.callbackAddr), \\"callbackFunctionId\\": $(decode_log.callbackFunctionId), \\"expiration\\": $(decode_log.cancelExpiration), \\"data\\": $(encode_data)}"]

    submit_tx    [type="ethtx" to="0x8650065E8c1E929FB6e79AC0ab7519938AcC3294" data="$(encode_tx)"]

    decode_log -> decode_cbor -> fetch -> parse_chain_id -> parse_receiver -> parse_amount -> encode_data -> encode_tx -> submit_tx
"""
