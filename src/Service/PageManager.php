<?php

namespace Octave\CMSBundle\Service;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Octave\CMSBundle\Entity\Page;
use Octave\CMSBundle\Page\Type\PageTypeInterface;
use Octave\CMSBundle\Repository\PageRepository;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class PageManager
{
    /** @var array */
    private $types = [];

    /** @var array */
    private $textPageTemplates = [];

    /** @var bool|array */
    private $pages = false;

    /** @var PageRepository */
    private $repository;

    /** @var RequestStack */
    private $requestStack;

    /** @var AuthorizationCheckerInterface */
    private $authorizationChecker;

    /**
     * PageManager constructor.
     * @param PageRepository $repository
     * @param RequestStack $requestStack
     * @param AuthorizationCheckerInterface $authorizationChecker
     */
    public function __construct(PageRepository $repository, RequestStack $requestStack,
                                AuthorizationCheckerInterface $authorizationChecker)
    {
        $this->repository = $repository;
        $this->requestStack = $requestStack;
        $this->authorizationChecker = $authorizationChecker;
    }

    /**
     * @return array
     */
    public function getTypes()
    {
        return $this->types;
    }

    /**
     * @param array $types
     */
    public function setTypes($types)
    {
        $this->types = $types;
    }

    /**
     * @param PageTypeInterface $type
     */
    public function addType($type)
    {
        $this->types[$type->getName()] = $type;
    }

    /**
     * @return array
     */
    public function getTextPageTemplates()
    {
        return $this->textPageTemplates;
    }

    /**
     * @param array $textPageTemplates
     */
    public function setTextPageTemplates($textPageTemplates)
    {
        $this->textPageTemplates = $textPageTemplates;
    }

    /**
     * @return array
     */
    public function getTextPageTemplatesAsChoices()
    {
        $choices = [];

        foreach ($this->textPageTemplates as $textPageTemplate) {
            $choices[$textPageTemplate['label']] = $textPageTemplate['path'];
        }

        return $choices;
    }

    /**
     * @return array|bool
     */
    public function getPages()
    {
        if ($this->pages === false) {

            $pages = $this->repository->findActive();
            $this->pages = [];

            /** @var Page $page */
            foreach ($pages as $page) {
                $this->pages[$page->getName()] = $page;
            }
        }

        return $this->pages;
    }

    /**
     * @return mixed|null
     */
    public function getCurrentPage()
    {
        $routeName = $this->requestStack->getCurrentRequest()->get('_route');
        return $this->pages[$routeName] ?? null;
    }

    /**
     * @return array
     */
    public function getAllowedPageTypes()
    {
        $types = $this->getTypes();
        $output = [];

        /** @var PageTypeInterface $type */
        foreach ($types as $type) {
            if (!$type->canCreateRole() || $this->authorizationChecker->isGranted($type->canCreateRole())) {
                $output[] = $type;
            }
        }

        return $output;
    }

    /**
     * @param $name
     * @return PageTypeInterface|null
     */
    public function getType($name)
    {
        return $this->types[$name] ?? null;
    }
}