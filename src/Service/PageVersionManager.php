<?php

namespace VideInfra\CMSBundle\Service;

use VideInfra\CMSBundle\Entity\Page;
use VideInfra\CMSBundle\Page\Type\PageTypeInterface;
use VideInfra\CMSBundle\Repository\PageVersionRepository;
use Doctrine\ORM\EntityManager;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class PageVersionManager
{
    /** @var PageManager */
    private $pageManager;

    /** @var PageVersionRepository */
    private $versionRepository;

    /** @var EntityManager */
    private $entityManager;

    /**
     * PageVersionManager constructor.
     * @param PageManager $pageManager
     * @param PageVersionRepository $versionRepository
     * @param EntityManager $em
     */
    public function __construct(PageManager $pageManager, PageVersionRepository $versionRepository, EntityManager $em)
    {
        $this->pageManager = $pageManager;
        $this->versionRepository = $versionRepository;
        $this->entityManager = $em;
    }

    /**
     * @param Page $page
     * @param null $version
     * @return \VideInfra\CMSBundle\Entity\PageVersion
     * @throws \Exception
     */
    public function storeVersion(Page $page, $version = null)
    {
        /** @var PageTypeInterface $type */
        $type = $this->pageManager->getType($page->getType());
        if (!$type) {
            throw new \Exception(sprintf('Unknown type %s', $page->getType()));
        }

        $content = $type->serialize($page);

        $lastVersion = $this->versionRepository->findLast($page);

        if ($version) {
            $number = $version;
        }
        else {
            $number = $lastVersion ? ($lastVersion->getVersion() + 1) : 1;
        }

        $newVersion = $this->versionRepository->fetchOrCreate($page, $number);
        $newVersion->setContent(json_encode($content));

        $this->entityManager->flush();

        return $newVersion;
    }

    /**
     * @param Page $page
     * @param $number
     * @return Page
     * @throws \Exception
     */
    public function restoreVersion(Page $page, $number)
    {
        $pageVersion = $this->versionRepository->findOneByVersion($page, $number);

        /** @var PageTypeInterface $type */
        $type = $this->pageManager->getType($page->getType());
        if (!$type) {
            throw new \Exception(sprintf('Unknown type %s', $page->getType()));
        }

        $page =$type->unserialize($pageVersion);
        $this->entityManager->flush();

        return $page;
    }
}