"use client";
import { Appbar } from "@/components/Appbar";
import { DarkButton } from "@/components/buttons/DarkButton";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL, HOOKS_URL } from "../config";
import { LinkButton } from "@/components/buttons/LinkButton";
import { useRouter } from "next/navigation";

interface Zap {
  id: string;
  triggerId: string;
  userId: number;
  actions: {
    id: string;
    zapId: string;
    actionId: string;
    sortingOrder: number;
    type: {
      id: string;
      name: string;
      image: string;
    };
  }[];
  trigger: {
    id: string;
    zapId: string;
    triggerId: string;
    type: {
      id: string;
      name: string;
      image: string;
    };
  };
}

function useZaps() {
  const [loading, setLoading] = useState(true);
  const [zaps, setZaps] = useState<Zap[]>([]);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/zap`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => {
        setZaps(res.data.zaps);
        setLoading(false);
      });
  }, []);

  return {
    loading,
    zaps,
  };
}

export default function () {
  const { loading, zaps } = useZaps();
  const router = useRouter();

  return (
    <div>
      <Appbar />
      <div className="flex justify-center pt-8">
        <div className="max-w-screen-lg w-full">
          <div className="flex justify-between pr-8">
            <div className="text-2xl font-bold">My Webhook</div>
            <DarkButton
              onClick={() => {
                router.push("/zap/create");
              }}
            >
              Create
            </DarkButton>
          </div>
        </div>
      </div>
      {loading ? (
        "Loading..."
      ) : (
        <div className="flex justify-center">
          <ZapTable zaps={zaps} />
        </div>
      )}
    </div>
  );
}

function ZapTable({ zaps }: { zaps: Zap[] }) {
  const router = useRouter();

  return (
    <div className="p-8 max-w-screen-lg w-full grid gap-2">
      {zaps.map((z) => (
        <div
          key={z.id}
          className="bg-white shadow-lg rounded-xl p-6 flex flex-col md:flex-row items-center justify-between border border-gray-200"
        >
          <div className="flex-1 flex items-center space-x-4">
            <img
              src={z.trigger.type.image}
              className="w-10 h-10 rounded-full object-cover"
              alt="Trigger"
            />
            <div className="flex space-x-2">
              {z.actions.map((x) => (
                <img
                  key={x.id}
                  src={x.type.image}
                  className="w-10 h-10 rounded-full object-cover"
                  alt="Action"
                />
              ))}
            </div>
          </div>
          <div className="flex-1 mt-4 md:mt-0 md:ml-4">
            <div className="text-sm text-gray-500">Webhook ID</div>
            <div className="text-gray-800 font-medium">{z.id}</div>
          </div>
          <div className="flex-1 mt-4 md:mt-0 md:ml-4">
            <div className="text-sm text-gray-500">Webhook URL</div>
            <div className="text-gray-800">
              {`${HOOKS_URL}/hooks/catch/1/${z.id}`}
            </div>
          </div>
          <div className="flex-1 mt-4 md:mt-0 md:ml-4">
            <LinkButton
              onClick={() => {
                router.push("/zap/" + z.id);
              }}
            >
              Go
            </LinkButton>
          </div>
        </div>
      ))}
    </div>
  );
}






