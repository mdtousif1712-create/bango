import pandas as pd
from typing import List, Tuple
from mlxtend.preprocessing import TransactionEncoder

def clean_and_encode_transactions(transactions: List[List[str]]) -> Tuple[pd.DataFrame, TransactionEncoder]:
    """
    Cleans transactions and converts into a boolean one-hot encoded DataFrame.
    """
    # Filter empty or single item records if any
    cleaned_txns = [[item.strip() for item in txn if item and isinstance(item, str)] for txn in transactions]
    cleaned_txns = [txn for txn in cleaned_txns if len(txn) >= 2]
    
    te = TransactionEncoder()
    te_ary = te.fit(cleaned_txns).transform(cleaned_txns)
    df = pd.DataFrame(te_ary, columns=te.columns_)
    return df, te
