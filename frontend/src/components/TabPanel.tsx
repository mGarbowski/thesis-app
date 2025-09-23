import type {ReactNode} from "react";
import {Box} from "@mui/material";

interface TabPanelProps {
    children?: ReactNode;
    index: number;
    value: number;
}

export const TabPanel = (props: TabPanelProps) => {
    const {children, value, index} = props;
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{p: 3}}>{children}</Box>}
        </div>
    );
};