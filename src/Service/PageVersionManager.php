<?php

namespace Octave\CMSBundle\Service;

use Octave\CMSBundle\Entity\Page;
use Octave\CMSBundle\Page\Type\PageTypeInterface;
use Octave\CMSBundle\Repository\PageVersionRepository;
use Doctrine\ORM\EntityManager;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
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
     * @return \Octave\CMSBundle\Entity\PageVersion
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
        if (!$content) {
            return null;
        }

        $lastVersion = $this->versionRepository->findLast($page);

        if ($version) {
            $number = $version;
        }
        else {
            $number = $lastVersion ? ((int) $lastVersion->getVersion() + 1) : 1;
        }

        $newVersion = $this->versionRepository->fetchOrCreate($page, $number);
        $newVersion->setContent(json_encode($content));

        $this->entityManager->flush($newVersion);

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

        $page = $type->unserialize($pageVersion);
        $this->entityManager->flush();

        return $page;
    }
}