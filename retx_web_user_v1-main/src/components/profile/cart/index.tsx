import { Tabs } from "antd";
import ProfileCartCollectionAsset from "./collection_asset";
import ProfileCartSingleAsset from "./single_asset";



export default function ProfileCart(){

    return (
        <div>
            <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Single Asset" key="1">
                    <ProfileCartSingleAsset/>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Collection Asset" key="2">
                    <ProfileCartCollectionAsset/>
                </Tabs.TabPane>
            </Tabs>
        </div>
    )
}